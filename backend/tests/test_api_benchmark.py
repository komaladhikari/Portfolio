from benchmarks.benchmark_api import markdown_report, run_benchmark


def test_api_benchmark_runs_against_isolated_data() -> None:
    results = run_benchmark(record_count=10, repetitions=2)

    assert set(results) == {"health", "owned_wish_status", "shared_sky"}
    assert all(timing.average_ms > 0 for timing in results.values())
    assert "GET /api/sky" in markdown_report(10, 2, results)
