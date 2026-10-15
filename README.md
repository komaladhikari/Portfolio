# Somewhere, a Star

The portfolio contains a React/Vite frontend in `frontend/` and a FastAPI,
SQLAlchemy, and Alembic backend in `backend/`.

## Local setup

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e '.[dev]'
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The development defaults use `http://127.0.0.1:8000` for the API and
`http://localhost:5173` for the frontend. Never place secrets in either example
environment file; Vite variables are visible in the browser.

## Wish lifecycle

1. The frontend submits validated text and visibility to `POST /api/wishes`.
2. The database stores the pending wish and only a hash of its claim token.
3. The browser stores the returned wish ID and claim token in `localStorage`.
4. Return visits retrieve authoritative status from the backend.
5. Catching the shooting star calls `POST /api/wishes/{id}/grant`.
6. A successful grant refreshes the paginated Shared Sky immediately.
7. Public wishes are approved automatically and expose their text after they are
   granted. Private wishes use the generic privacy message.

## Verification

```bash
cd backend
.venv/bin/pytest
.venv/bin/python -m compileall -q app benchmarks
APP_DATABASE_URL='postgresql+psycopg://user:password@localhost/app' \
  .venv/bin/alembic upgrade head --sql

cd ../frontend
npm test -- --run
npm run build
```

The project does not currently define a separate lint command. The production
build runs TypeScript checking before Vite bundling.

## Local performance snapshot

Measured on macOS 14.7.4 with Python 3.12.1 and Node 23.9.0:

| Measurement | Average | p95 |
| --- | ---: | ---: |
| Health API | 0.618 ms | 0.708 ms |
| Owned-wish status API | 1.303 ms | 1.522 ms |
| Shared Sky API, 10,000 SQLite rows, 50 returned | 17.114 ms | 21.783 ms |
| Layout plus server render, 100 stars | 1.299 ms | 1.681 ms |

API measurements use in-process TestClient requests and disposable SQLite data.
Frontend measurements use React server rendering. They exclude network latency,
browser painting, and production hosting behavior. See
`backend/docs/benchmarks/` for reproducible backend measurements.

## Known limitations before deployment

- Claim tokens in `localStorage` are browser-specific and can be lost if site
  data is cleared. HTTPS and strong XSS protections are required.
- Rate limiting is process-local. Multiple backend workers need gateway or
  shared-store rate limiting.
- Public wishes are published without human review after granting. React escapes
  their text, but deployments should still consider abuse reporting or moderation.
- Shared Sky uses offset pagination, which can shift if new grants arrive while
  older pages are being loaded.
- SQLite benchmarks do not replace staging tests against PostgreSQL. Task 9
  identified a promising Shared Sky index, but no production migration was
  added without explicit approval and PostgreSQL verification.
- Automated tests do not measure real-browser animation smoothness, screen-reader
  output, or physical mobile tapping. Complete a manual accessibility and device
  pass before deployment.
