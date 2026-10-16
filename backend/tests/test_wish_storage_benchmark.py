from pathlib import Path

from benchmarks.benchmark_wish_storage import markdown_report, run_benchmark


def test_benchmark_uses_disposable_database_and_reports_measurements(
    tmp_path: Path,
) -> None:
    result = run_benchmark(100, tmp_path)

    assert result.records == 100
    assert result.database_bytes > 0
    assert result.insert_seconds > 0
    assert result.average_id_retrieval_ms >= 0
    assert result.average_sky_query_ms >= 0
    assert result.peak_memory_mib > 0
    assert result.utf8_bytes > 0
    assert result.compressed_bytes > 0
    assert "SCAN wishes" in result.plan_before
    assert "ix_wishes_sky_feed" in result.plan_after


def test_markdown_report_contains_comparison_tables(tmp_path: Path) -> None:
    result = run_benchmark(25, tmp_path)

    report = markdown_report([result], elapsed_seconds=1.0)

    assert "## Database measurements" in report
    assert "## Per-wish zlib measurements" in report
    assert "## Query-plan comparison" in report
    assert "Keep plain text for now" in report
