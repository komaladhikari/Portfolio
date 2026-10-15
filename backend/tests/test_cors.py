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
