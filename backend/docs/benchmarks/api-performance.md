# API performance verification

Synthetic granted wishes: 10,000. Requests per endpoint: 100.
The benchmark uses FastAPI TestClient and a disposable SQLite database; it excludes network latency.

| Endpoint | Average | p95 |
| --- | ---: | ---: |
| GET /api/health | 0.618 ms | 0.708 ms |
| GET /api/wishes/{id}/status | 1.303 ms | 1.522 ms |
| GET /api/sky?limit=50 | 17.114 ms | 21.783 ms |

These values are local regression indicators, not production latency guarantees.
