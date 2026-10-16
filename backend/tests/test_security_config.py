import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.config import Settings
from app.main import app


def test_production_settings_accept_explicit_secure_values() -> None:
    settings = Settings(
        _env_file=None,
        environment="production",
        debug=False,
        database_url="postgresql+psycopg://user:password@db.example/app",
        cors_origins="https://portfolio.example",
        allowed_hosts="api.example",
    )

    assert settings.allowed_origins == ["https://portfolio.example"]
    assert settings.trusted_hosts == ["api.example"]


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("debug", True),
        ("database_url", "sqlite:///./production.db"),
        ("cors_origins", "*"),
        ("cors_origins", ""),
        ("allowed_hosts", "*"),
        ("allowed_hosts", ""),
    ],
)
def test_production_settings_reject_unsafe_values(field: str, value: object) -> None:
    values = {
        "environment": "production",
        "debug": False,
        "database_url": "postgresql+psycopg://user:password@db.example/app",
        "cors_origins": "https://portfolio.example",
        "allowed_hosts": "api.example",
        field: value,
    }

    with pytest.raises(ValidationError):
        Settings(_env_file=None, **values)


@pytest.mark.parametrize(
    "field",
    ["wish_submit_rate_limit", "wish_grant_rate_limit", "rate_limit_window_seconds"],
)
def test_rate_limit_settings_must_be_positive(field: str) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **{field: 0})


def test_untrusted_host_is_rejected() -> None:
    with TestClient(app, base_url="http://untrusted.example") as client:
        response = client.get("/api/health")

    assert response.status_code == 400
