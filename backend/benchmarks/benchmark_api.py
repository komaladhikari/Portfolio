"""Measure in-process API latency with an isolated synthetic SQLite database."""

from __future__ import annotations

import argparse
import hashlib
import statistics
import tempfile
import time
import uuid
from collections.abc import Callable, Generator
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, insert
from sqlalchemy.orm import Session

from app.database import Base, get_db
from app.main import app
from app.models import ModerationStatus, Wish, WishStatus, WishVisibility
from app.rate_limit import grant_limiter, submission_limiter
from app.services import hash_claim_token


@dataclass(frozen=True)
class Timing:
    average_ms: float
    p95_ms: float


def _time(operation: Callable[[], None], repetitions: int) -> Timing:
    durations: list[float] = []
    for _ in range(repetitions):
        started = time.perf_counter()
        operation()
        durations.append((time.perf_counter() - started) * 1_000)
    durations.sort()
    p95_index = min(len(durations) - 1, round(len(durations) * 0.95) - 1)
    return Timing(statistics.fmean(durations), durations[p95_index])


def _seed_rows(start: int, count: int) -> list[dict[str, object]]:
    base_time = datetime(2026, 1, 1, tzinfo=timezone.utc)
    rows: list[dict[str, object]] = []
    for index in range(start, start + count):
        wish_id = uuid.uuid5(uuid.NAMESPACE_URL, f"api-benchmark-{index}")
        rows.append(
            {
                "id": wish_id,
                "text": f"Synthetic granted wish {index}",
                "status": WishStatus.GRANTED,
                "visibility": WishVisibility.PUBLIC,
                "moderation_status": ModerationStatus.APPROVED,
                "created_at": base_time + timedelta(seconds=index),
                "granted_at": base_time + timedelta(seconds=index, minutes=1),
                "sky_x": float((index * 37) % 10_000) / 100,
                "sky_y": float((index * 53) % 10_000) / 100,
                "claim_token_hash": hashlib.sha256(
                    f"synthetic-token-{index}".encode()
                ).hexdigest(),
            }
        )
    return rows


def run_benchmark(record_count: int, repetitions: int) -> dict[str, Timing]:
    if record_count <= 0 or repetitions <= 0:
        raise ValueError("record_count and repetitions must be positive")

    with tempfile.TemporaryDirectory(prefix="wish-api-benchmark-") as directory:
        engine = create_engine(f"sqlite:///{Path(directory) / 'api.db'}")
        Base.metadata.create_all(engine)
        owner_id = uuid.uuid4()
        owner_token = "benchmark-owner-token"
        with engine.begin() as connection:
            for start in range(0, record_count, 1_000):
                batch_count = min(1_000, record_count - start)
                connection.execute(insert(Wish), _seed_rows(start, batch_count))
            connection.execute(
                insert(Wish),
                [{
                    "id": owner_id,
                    "text": "Benchmark pending wish",
                    "status": WishStatus.PENDING,
                    "visibility": WishVisibility.PRIVATE,
                    "moderation_status": ModerationStatus.PENDING,
                    "created_at": datetime.now(timezone.utc),
                    "granted_at": None,
                    "sky_x": 50.0,
                    "sky_y": 50.0,
                    "claim_token_hash": hash_claim_token(owner_token),
                }],
            )

        def override_get_db() -> Generator[Session, None, None]:
            with Session(engine) as session:
                yield session

        app.dependency_overrides[get_db] = override_get_db
        submission_limiter.reset()
        grant_limiter.reset()
        try:
            with TestClient(app) as client:
                def health() -> None:
                    assert client.get("/api/health").status_code == 200

                def status() -> None:
                    response = client.get(
                        f"/api/wishes/{owner_id}/status",
                        headers={"X-Claim-Token": owner_token},
                    )
                    assert response.status_code == 200

                def sky() -> None:
                    response = client.get("/api/sky?limit=50&offset=0")
                    assert response.status_code == 200
                    assert len(response.json()["stars"]) == min(50, record_count)

                return {
                    "health": _time(health, repetitions),
                    "owned_wish_status": _time(status, repetitions),
                    "shared_sky": _time(sky, repetitions),
                }
        finally:
            app.dependency_overrides.clear()
            engine.dispose()


def markdown_report(record_count: int, repetitions: int, results: dict[str, Timing]) -> str:
    lines = [
        "# API performance verification",
        "",
        f"Synthetic granted wishes: {record_count:,}. Requests per endpoint: {repetitions}.",
        "The benchmark uses FastAPI TestClient and a disposable SQLite database; it excludes network latency.",
        "",
        "| Endpoint | Average | p95 |",
        "| --- | ---: | ---: |",
    ]
    labels = {
        "health": "GET /api/health",
        "owned_wish_status": "GET /api/wishes/{id}/status",
        "shared_sky": "GET /api/sky?limit=50",
    }
    for name, timing in results.items():
        lines.append(
            f"| {labels[name]} | {timing.average_ms:.3f} ms | {timing.p95_ms:.3f} ms |"
        )
    lines.extend(
        [
            "",
            "These values are local regression indicators, not production latency guarantees.",
            "",
        ]
    )
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--records", type=int, default=10_000)
    parser.add_argument("--repetitions", type=int, default=100)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    results = run_benchmark(args.records, args.repetitions)
    report = markdown_report(args.records, args.repetitions, results)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(report, encoding="utf-8")
    else:
        print(report)


if __name__ == "__main__":
    main()
