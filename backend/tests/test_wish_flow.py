import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import ModerationStatus, Wish
from app.routers.sky import PRIVATE_WISH_MESSAGE


def test_complete_public_wish_flow_requires_moderation(
    api_client: TestClient,
    db_session: Session,
) -> None:
    dangerous_text = '<script>alert("xss")</script>'
    created_response = api_client.post(
        "/api/wishes",
        json={"text": dangerous_text, "visibility": "public"},
    )
    assert created_response.status_code == 201
    created = created_response.json()

    pending_response = api_client.get(
        f"/api/wishes/{created['id']}/status",
        headers={"X-Claim-Token": created["claim_token"]},
    )
    assert pending_response.status_code == 200
    assert pending_response.json()["status"] == "pending"
    assert pending_response.json()["granted_at"] is None
    assert api_client.get("/api/sky").json()["stars"] == []

    granted_response = api_client.post(
        f"/api/wishes/{created['id']}/grant",
        headers={"X-Claim-Token": created["claim_token"]},
    )
    assert granted_response.status_code == 200
    assert granted_response.json()["status"] == "granted"

    hidden_star = api_client.get("/api/sky").json()["stars"][0]
    assert hidden_star["text"] == PRIVATE_WISH_MESSAGE
    assert dangerous_text not in str(hidden_star)
    assert created["claim_token"] not in str(hidden_star)

    wish = db_session.get(Wish, uuid.UUID(created["id"]))
    assert wish is not None
    wish.moderation_status = ModerationStatus.APPROVED
    db_session.commit()

    approved_star = api_client.get("/api/sky").json()["stars"][0]
    assert approved_star["text"] == dangerous_text
    assert set(approved_star) == {"id", "x", "y", "visibility", "text"}


def test_duplicate_submission_requests_receive_distinct_credentials(
    api_client: TestClient,
) -> None:
    payload = {"text": "The same intentional wish", "visibility": "private"}

    first = api_client.post("/api/wishes", json=payload)
    second = api_client.post("/api/wishes", json=payload)

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] != second.json()["id"]
    assert first.json()["claim_token"] != second.json()["claim_token"]
