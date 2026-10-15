# Wish storage benchmark

Generated with Python 3.12.1 on macOS-14.7.4-arm64-arm-64bit.
Total benchmark time: 39.32 seconds.

## Database measurements

| Rows | DB size | With sky index | Insert/row | ID lookup | Sky query | Indexed sky | Peak Python memory |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000 | 0.38 MiB | 0.45 MiB | 0.1572 ms | 0.1249 ms | 1.4853 ms | 0.4406 ms | 1.28 MiB |
| 10,000 | 3.67 MiB | 4.32 MiB | 0.1569 ms | 0.1188 ms | 13.0613 ms | 0.4509 ms | 1.16 MiB |
| 100,000 | 36.84 MiB | 43.41 MiB | 0.2148 ms | 0.1220 ms | 139.6811 ms | 0.4503 ms | 1.29 MiB |

## Per-wish zlib measurements

Compression is applied to each text independently because rows must remain independently readable.

| Rows | Plain UTF-8 | zlib | Ratio (zlib/plain) | Compress | Decompress |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1,000 | 0.05 MiB | 0.05 MiB | 1.138 | 5.35 us | 0.86 us |
| 10,000 | 0.47 MiB | 0.53 MiB | 1.138 | 5.37 us | 0.86 us |
| 100,000 | 4.67 MiB | 5.32 MiB | 1.138 | 5.73 us | 0.88 us |

## Query-plan comparison

- Before: `SCAN wishes; USE TEMP B-TREE FOR ORDER BY`
- Temporary index: `SEARCH wishes USING INDEX ix_wishes_sky_feed (status=?)`
- Index storage overhead at 100,000 rows: 6.57 MiB.

## Interpretation

- UUID retrieval already uses the primary-key index and does not need another index.
- The current Shared Sky query scans and sorts; the temporary composite index can satisfy both filtering and ordering.
- Short wish strings are poor per-row zlib candidates because compression headers can outweigh repetition savings.
- Keep plain text for now. Consider the composite Shared Sky index only after confirming the result on PostgreSQL with production-like traffic.
- These are local synthetic SQLite results, not production capacity guarantees.

## Reproduce

```bash
.venv/bin/python -m benchmarks.benchmark_wish_storage --output docs/benchmarks/wish-storage.md
```
