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
