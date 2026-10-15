import hashlib
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.database import get_db
from app.main import app
from app.models import ModerationStatus, Wish, WishStatus, WishVisibility


def test_create_wish_persists_pending_wish(
    api_client: TestClient,
    db_session: Session,
) -> None:
    response = api_client.post(
        "/api/wishes",
        json={"text": "  I wish to keep learning.  ", "visibility": "public"},
    )

    assert response.status_code == 201
    body = response.json()
    assert set(body) == {"id", "claim_token", "status"}
    wish_id = uuid.UUID(body["id"])
    assert body["status"] == "pending"
    assert len(body["claim_token"]) >= 32

    saved_wish = db_session.scalar(select(Wish).where(Wish.id == wish_id))
    assert saved_wish is not None
    assert saved_wish.text == "I wish to keep learning."
    assert saved_wish.status is WishStatus.PENDING
    assert saved_wish.visibility is WishVisibility.PUBLIC
    assert saved_wish.moderation_status is ModerationStatus.APPROVED
    assert saved_wish.created_at is not None
    assert saved_wish.granted_at is None
    assert 0 <= saved_wish.sky_x <= 100
    assert 0 <= saved_wish.sky_y <= 100
    assert saved_wish.claim_token_hash == hashlib.sha256(
        body["claim_token"].encode("utf-8"),
    ).hexdigest()
    assert saved_wish.claim_token_hash != body["claim_token"]


def test_create_wishes_accepts_limit_and_generates_unique_credentials(
    api_client: TestClient,
) -> None:
    first_response = api_client.post(
        "/api/wishes",
        json={"text": "x" * 200, "visibility": "private"},
    )
    second_response = api_client.post(
        "/api/wishes",
        json={"text": "Another wish", "visibility": "private"},
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 201
    assert first_response.json()["id"] != second_response.json()["id"]
    assert first_response.json()["claim_token"] != second_response.json()["claim_token"]


@pytest.mark.parametrize(
    "payload",
    [
        {"text": "", "visibility": "public"},
        {"text": "   ", "visibility": "private"},
        {"text": "x" * 201, "visibility": "public"},
        {"text": "A valid wish", "visibility": "friends-only"},
    ],
)
def test_create_wish_rejects_invalid_input(
    api_client: TestClient,
    payload: dict[str, str],
) -> None:
    response = api_client.post("/api/wishes", json=payload)

    assert response.status_code == 422


def test_create_wish_hides_database_error() -> None:
    class FailingSession:
        def add(self, wish: Wish) -> None:
            pass

        def commit(self) -> None:
            raise OperationalError("INSERT", {}, Exception("private database detail"))

        def rollback(self) -> None:
            pass

    def override_get_db():
        yield FailingSession()

    app.dependency_overrides[get_db] = override_get_db
    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/wishes",
                json={"text": "A wish", "visibility": "private"},
            )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 503
    assert response.json() == {"detail": "Wish could not be saved."}
    assert "private database detail" not in response.text
