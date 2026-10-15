"""Benchmark wish storage without connecting to the application database.

The benchmark creates one disposable SQLite database per requested size inside a
temporary directory. It deliberately does not import or use ``app.database.engine``.
"""

from __future__ import annotations

import argparse
import json
import platform
import random
import statistics
import tempfile
import time
import tracemalloc
import uuid
import zlib
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable

from sqlalchemy import Engine, create_engine, event, insert, select, text
from sqlalchemy.orm import Session

from app.database import Base
from app.models import ModerationStatus, Wish, WishStatus, WishVisibility


SKY_LIMIT = 50
SAMPLE_QUERIES = 100
INSERT_BATCH_SIZE = 1_000
SKY_INDEX_SQL = (
    "CREATE INDEX ix_wishes_sky_feed "
    "ON wishes (status, granted_at DESC, id)"
)
TEXT_TEMPLATES = (
    "I wish for calm mornings and kind people.",
    "May my family stay healthy and close.",
    "I hope to find courage for the next chapter.",
    "A peaceful home beneath a sky full of stars.",
    "Let tomorrow bring a small and unexpected joy.",
    "I wish to learn something that changes my life.",
    "May everyone who feels lost find their way home.",
    "I hope this year is gentler than the last one.",
)


@dataclass(frozen=True)
class BenchmarkResult:
    records: int
    database_bytes: int
    indexed_database_bytes: int
    insert_seconds: float
    average_insert_ms: float
    average_id_retrieval_ms: float
    average_sky_query_ms: float
    average_indexed_sky_query_ms: float
    peak_memory_mib: float
    utf8_bytes: int
    compressed_bytes: int
    compression_ratio: float
    average_compress_us: float
    average_decompress_us: float
    plan_before: str
    plan_after: str


def synthetic_text(index: int) -> str:
    """Return deterministic, varied text that resembles a short submitted wish."""
    template = TEXT_TEMPLATES[index % len(TEXT_TEMPLATES)]
    return f"{template} #{index % 997}"


def wish_rows(start: int, count: int) -> Iterable[dict[str, object]]:
    """Yield deterministic rows without retaining the full data set in memory."""
    base_time = datetime(2026, 1, 1, tzinfo=timezone.utc)
    for index in range(start, start + count):
        wish_id = uuid.uuid5(uuid.NAMESPACE_URL, f"wish-benchmark-{index}")
        granted = index % 10 < 7
        created_at = base_time + timedelta(seconds=index)
        yield {
            "id": wish_id,
            "text": synthetic_text(index),
            "status": WishStatus.GRANTED if granted else WishStatus.PENDING,
            "visibility": (
                WishVisibility.PUBLIC if index % 2 == 0 else WishVisibility.PRIVATE
            ),
            "moderation_status": (
                ModerationStatus.APPROVED
                if index % 4 == 0
                else ModerationStatus.PENDING
            ),
            "created_at": created_at,
            "granted_at": created_at + timedelta(minutes=5) if granted else None,
            "sky_x": float((index * 37) % 10_000) / 100,
            "sky_y": float((index * 53) % 10_000) / 100,
            "claim_token_hash": uuid.uuid5(
                uuid.NAMESPACE_OID, f"token-{index}"
            ).hex.ljust(64, "0"),
        }


def _timed_average_ms(operation, repetitions: int) -> float:
    durations: list[float] = []
    for _ in range(repetitions):
        started = time.perf_counter()
        operation()
        durations.append(time.perf_counter() - started)
    return statistics.fmean(durations) * 1_000


def _database_size(engine: Engine, database_path: Path) -> int:
    with engine.connect() as connection:
        connection.execute(text("PRAGMA wal_checkpoint(TRUNCATE)"))
    return database_path.stat().st_size


def _query_plan(session: Session) -> str:
    rows = session.execute(
        text(
            "EXPLAIN QUERY PLAN SELECT * FROM wishes "
            "WHERE status = 'granted' "
            "ORDER BY granted_at DESC, id LIMIT 50 OFFSET 0"
        )
    ).all()
    return "; ".join(str(row[3]) for row in rows)


def _compression_measurements(record_count: int) -> tuple[int, int, float, float]:
    sample_count = min(record_count, 10_000)
    texts = [synthetic_text(index).encode("utf-8") for index in range(sample_count)]

    started = time.perf_counter()
    compressed = [zlib.compress(value) for value in texts]
    compress_seconds = time.perf_counter() - started

    started = time.perf_counter()
    decompressed = [zlib.decompress(value) for value in compressed]
    decompress_seconds = time.perf_counter() - started
    if decompressed != texts:
        raise RuntimeError("Compression round trip changed wish text")

    utf8_bytes = sum(len(value) for value in texts)
    compressed_bytes = sum(len(value) for value in compressed)
    scale = record_count / sample_count
    return (
        round(utf8_bytes * scale),
        round(compressed_bytes * scale),
        compress_seconds / sample_count * 1_000_000,
        decompress_seconds / sample_count * 1_000_000,
    )


def run_benchmark(record_count: int, work_directory: Path) -> BenchmarkResult:
    """Run one benchmark size against a new disposable SQLite database."""
    database_path = work_directory / f"wishes-{record_count}.db"
    engine = create_engine(f"sqlite:///{database_path}")

    @event.listens_for(engine, "connect")
    def configure_sqlite(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

    Base.metadata.create_all(engine)
    tracemalloc.start()
    started = time.perf_counter()
    with engine.begin() as connection:
        for batch_start in range(0, record_count, INSERT_BATCH_SIZE):
            batch_count = min(INSERT_BATCH_SIZE, record_count - batch_start)
            connection.execute(insert(Wish), list(wish_rows(batch_start, batch_count)))
    insert_seconds = time.perf_counter() - started
    _current_memory, peak_memory = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    database_bytes = _database_size(engine, database_path)
    rng = random.Random(42)
    sample_ids = [
        uuid.uuid5(uuid.NAMESPACE_URL, f"wish-benchmark-{rng.randrange(record_count)}")
        for _ in range(min(SAMPLE_QUERIES, record_count))
    ]
    sky_statement = (
        select(Wish)
        .where(Wish.status == WishStatus.GRANTED)
        .order_by(Wish.granted_at.desc(), Wish.id)
        .limit(SKY_LIMIT)
        .offset(0)
    )

    with Session(engine) as session:
        id_iterator = iter(sample_ids)

        def retrieve_by_id() -> None:
            try:
                wish_id = next(id_iterator)
            except StopIteration:
                return
            session.scalar(select(Wish).where(Wish.id == wish_id))

        retrieval_ms = _timed_average_ms(retrieve_by_id, len(sample_ids))
        session.scalars(sky_statement).all()  # warm caches before timing
        sky_ms = _timed_average_ms(
            lambda: session.scalars(sky_statement).all(), SAMPLE_QUERIES
        )
        plan_before = _query_plan(session)

        session.execute(text(SKY_INDEX_SQL))
        session.commit()
        session.expire_all()
        session.scalars(sky_statement).all()
        indexed_sky_ms = _timed_average_ms(
            lambda: session.scalars(sky_statement).all(), SAMPLE_QUERIES
        )
        plan_after = _query_plan(session)

    indexed_database_bytes = _database_size(engine, database_path)
    utf8_bytes, compressed_bytes, compress_us, decompress_us = (
        _compression_measurements(record_count)
    )
    engine.dispose()

    return BenchmarkResult(
        records=record_count,
        database_bytes=database_bytes,
        indexed_database_bytes=indexed_database_bytes,
        insert_seconds=insert_seconds,
        average_insert_ms=insert_seconds / record_count * 1_000,
        average_id_retrieval_ms=retrieval_ms,
        average_sky_query_ms=sky_ms,
        average_indexed_sky_query_ms=indexed_sky_ms,
        peak_memory_mib=peak_memory / (1024 * 1024),
        utf8_bytes=utf8_bytes,
        compressed_bytes=compressed_bytes,
        compression_ratio=compressed_bytes / utf8_bytes,
        average_compress_us=compress_us,
        average_decompress_us=decompress_us,
        plan_before=plan_before,
        plan_after=plan_after,
    )


def _format_bytes(byte_count: int) -> str:
    return f"{byte_count / (1024 * 1024):.2f} MiB"


def markdown_report(results: list[BenchmarkResult], elapsed_seconds: float) -> str:
    lines = [
        "# Wish storage benchmark",
        "",
        f"Generated with Python {platform.python_version()} on {platform.platform()}.",
        f"Total benchmark time: {elapsed_seconds:.2f} seconds.",
        "",
        "## Database measurements",
        "",
        "| Rows | DB size | With sky index | Insert/row | ID lookup | Sky query | Indexed sky | Peak Python memory |",
        "| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for result in results:
        lines.append(
            "| "
            f"{result.records:,} | {_format_bytes(result.database_bytes)} | "
            f"{_format_bytes(result.indexed_database_bytes)} | "
            f"{result.average_insert_ms:.4f} ms | "
            f"{result.average_id_retrieval_ms:.4f} ms | "
            f"{result.average_sky_query_ms:.4f} ms | "
            f"{result.average_indexed_sky_query_ms:.4f} ms | "
            f"{result.peak_memory_mib:.2f} MiB |"
        )
    lines.extend(
        [
            "",
            "## Per-wish zlib measurements",
            "",
            "Compression is applied to each text independently because rows must remain independently readable.",
            "",
            "| Rows | Plain UTF-8 | zlib | Ratio (zlib/plain) | Compress | Decompress |",
            "| ---: | ---: | ---: | ---: | ---: | ---: |",
        ]
    )
    for result in results:
        lines.append(
            "| "
            f"{result.records:,} | {_format_bytes(result.utf8_bytes)} | "
            f"{_format_bytes(result.compressed_bytes)} | "
            f"{result.compression_ratio:.3f} | "
            f"{result.average_compress_us:.2f} us | "
            f"{result.average_decompress_us:.2f} us |"
        )
    largest = results[-1]
    index_overhead = largest.indexed_database_bytes - largest.database_bytes
    lines.extend(
        [
            "",
            "## Query-plan comparison",
            "",
            f"- Before: `{largest.plan_before}`",
            f"- Temporary index: `{largest.plan_after}`",
            f"- Index storage overhead at {largest.records:,} rows: {_format_bytes(index_overhead)}.",
            "",
            "## Interpretation",
            "",
            "- UUID retrieval already uses the primary-key index and does not need another index.",
            "- The current Shared Sky query scans and sorts; the temporary composite index can satisfy both filtering and ordering.",
            "- Short wish strings are poor per-row zlib candidates because compression headers can outweigh repetition savings.",
            "- Keep plain text for now. Consider the composite Shared Sky index only after confirming the result on PostgreSQL with production-like traffic.",
            "- These are local synthetic SQLite results, not production capacity guarantees.",
            "",
            "## Reproduce",
            "",
            "```bash",
            ".venv/bin/python -m benchmarks.benchmark_wish_storage --output docs/benchmarks/wish-storage.md",
            "```",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sizes", nargs="+", type=int, default=[1_000, 10_000, 100_000])
    parser.add_argument("--output", type=Path)
    parser.add_argument("--json-output", type=Path)
    args = parser.parse_args()
    if any(size <= 0 for size in args.sizes):
        parser.error("all sizes must be positive")

    started = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="wish-benchmark-") as temporary_directory:
        work_directory = Path(temporary_directory)
        results = [run_benchmark(size, work_directory) for size in args.sizes]
    elapsed_seconds = time.perf_counter() - started

    report = markdown_report(results, elapsed_seconds)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(report, encoding="utf-8")
    else:
        print(report)
    if args.json_output:
        args.json_output.parent.mkdir(parents=True, exist_ok=True)
        args.json_output.write_text(
            json.dumps([asdict(result) for result in results], indent=2),
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
