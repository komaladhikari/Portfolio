# Somewhere, a Star API

## Requirements

- Python 3.11 or newer

## Local setup

Run these commands from the `backend` directory:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e '.[dev]'
```

Optionally copy `.env.example` to `.env` to customize local settings. The
application has safe development defaults, so this is not required.

## Database

SQLite is used for local development. Create or update the local schema with:

```bash
alembic upgrade head
```

The database URL can be changed through `APP_DATABASE_URL`. Alembic migrations
must be applied before code that depends on a new schema is run.

For PostgreSQL support, install the optional driver:

```bash
python -m pip install -e '.[dev,postgres]'
```

## Run the server

```bash
uvicorn app.main:app --reload
```

Open:

- Health endpoint: <http://127.0.0.1:8000/api/health>
- Interactive API documentation: <http://127.0.0.1:8000/docs>

## Run tests

```bash
pytest
```

## Benchmark wish storage

The benchmark uses synthetic wishes in disposable SQLite databases. It never
connects to the application database:

```bash
python -m benchmarks.benchmark_wish_storage \
  --output docs/benchmarks/wish-storage.md
```

Results depend on the machine and should be regenerated when evaluating a
database or deployment change.

## Deployment preparation

Do not use the development defaults in production. Configure at least:

```dotenv
APP_ENVIRONMENT=production
APP_DEBUG=false
APP_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST/DATABASE
APP_CORS_ORIGINS=https://portfolio.example
APP_ALLOWED_HOSTS=api.example
APP_WISH_SUBMIT_RATE_LIMIT=10
APP_WISH_GRANT_RATE_LIMIT=30
APP_RATE_LIMIT_WINDOW_SECONDS=60
```

Before starting a release:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Production validation rejects debug mode, SQLite, wildcard CORS origins, and
wildcard hosts. Terminate HTTPS at the hosting platform or reverse proxy.

The built-in rate limiter is intentionally small and process-local. It protects
a single application process, but multiple workers do not share counters. Add
edge or gateway rate limiting before scaling to multiple processes. The app uses
the direct client address and does not trust spoofable forwarding headers.

Never place real passwords, claim tokens, or deployed URLs containing secrets in
`.env.example` or source control.
