import uuid
from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.database import Base, get_db
from app.main import app


def create_wish(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/wishes",
        json={"text": "A private wish", "visibility": "private"},
    )
    assert response.status_code == 201
    return response.json()


def test_get_wish_status_with_valid_token(api_client: TestClient) -> None:
    created = create_wish(api_client)

    response = api_client.get(
        f"/api/wishes/{created['id']}/status",
        headers={"X-Claim-Token": created["claim_token"]},
    )

    assert response.status_code == 200
    assert set(response.json()) == {"id", "status", "created_at", "granted_at"}
    assert response.json()["id"] == created["id"]
    assert response.json()["status"] == "pending"
    assert response.json()["created_at"] is not None
    assert response.json()["granted_at"] is None
    assert "text" not in response.text
    assert created["claim_token"] not in response.text


def test_get_wish_status_rejects_invalid_token(api_client: TestClient) -> None:
    created = create_wish(api_client)

    response = api_client.get(
        f"/api/wishes/{created['id']}/status",
        headers={"X-Claim-Token": "incorrect-token"},
    )

    assert response.status_code == 403
    assert response.json() == {"detail": "Invalid claim token."}


def test_get_wish_status_requires_token(api_client: TestClient) -> None:
    created = create_wish(api_client)

    response = api_client.get(f"/api/wishes/{created['id']}/status")

    assert response.status_code == 422


def test_get_wish_status_returns_404_for_unknown_wish(api_client: TestClient) -> None:
    response = api_client.get(
        f"/api/wishes/{uuid.uuid4()}/status",
        headers={"X-Claim-Token": "any-token"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Wish not found."}


def test_wish_status_persists_across_database_sessions(tmp_path) -> None:
    database_path = tmp_path / "persistent.db"
    database_url = f"sqlite:///{database_path}"
    first_engine = create_engine(database_url)
    Base.metadata.create_all(first_engine)

    with Session(first_engine) as first_session:
        def first_override() -> Generator[Session, None, None]:
            yield first_session

        app.dependency_overrides[get_db] = first_override
        with TestClient(app) as client:
            created = create_wish(client)

    app.dependency_overrides.clear()
    first_engine.dispose()

    second_engine = create_engine(database_url)
    with Session(second_engine) as second_session:
        def second_override() -> Generator[Session, None, None]:
            yield second_session

        app.dependency_overrides[get_db] = second_override
        try:
            with TestClient(app) as client:
                response = client.get(
                    f"/api/wishes/{created['id']}/status",
                    headers={"X-Claim-Token": created["claim_token"]},
                )
        finally:
            app.dependency_overrides.clear()

    second_engine.dispose()

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]
    assert response.json()["status"] == "pending"
