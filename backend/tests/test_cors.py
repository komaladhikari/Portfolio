from fastapi.testclient import TestClient

from app.main import app


def test_cors_allows_local_frontend() -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/wishes",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type,X-Claim-Token",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_cors_allows_vite_fallback_port() -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/writing",
            headers={
                "Origin": "http://localhost:5174",
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"


def test_cors_allows_deployed_frontend() -> None:
    origin = "https://portfolio-liard-eta-89.vercel.app"
    with TestClient(app) as client:
        response = client.options(
            "/api/wishes",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == origin


def test_cors_allows_wish_deletion_from_local_frontend() -> None:
    with TestClient(app) as client:
        response = client.options(
            "/api/wishes/00000000-0000-0000-0000-000000000000",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "DELETE",
                "Access-Control-Request-Headers": "X-Claim-Token",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "DELETE" in response.headers["access-control-allow-methods"]
