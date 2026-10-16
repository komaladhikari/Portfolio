import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import Wish


def create_and_grant_wish(api_client: TestClient) -> dict[str, str]:
    created = api_client.post(
        "/api/wishes",
        json={"text": "A removable wish", "visibility": "public"},
    ).json()
    granted = api_client.post(
        f"/api/wishes/{created['id']}/grant",
        headers={"X-Claim-Token": created["claim_token"]},
    )
    assert granted.status_code == 200
    return created


def test_owner_can_delete_wish(
    api_client: TestClient,
    db_session: Session,
) -> None:
    created = create_and_grant_wish(api_client)

    response = api_client.delete(
        f"/api/wishes/{created['id']}",
        headers={"X-Claim-Token": created["claim_token"]},
    )

    assert response.status_code == 200
    assert response.json() == {"id": created["id"], "deleted": True}
    assert db_session.get(Wish, uuid.UUID(created["id"])) is None
    assert api_client.get("/api/sky").json()["stars"] == []


def test_invalid_token_cannot_delete_wish(
    api_client: TestClient,
    db_session: Session,
) -> None:
    created = create_and_grant_wish(api_client)

    response = api_client.delete(
        f"/api/wishes/{created['id']}",
        headers={"X-Claim-Token": "not-the-owner-token"},
    )

    assert response.status_code == 403
    assert db_session.get(Wish, uuid.UUID(created["id"])) is not None


def test_deleting_nonexistent_wish_returns_not_found(api_client: TestClient) -> None:
    response = api_client.delete(
        f"/api/wishes/{uuid.uuid4()}",
        headers={"X-Claim-Token": "unused-token"},
    )

    assert response.status_code == 404


def test_deleted_wish_stays_deleted(api_client: TestClient) -> None:
    created = create_and_grant_wish(api_client)
    headers = {"X-Claim-Token": created["claim_token"]}

    assert api_client.delete(f"/api/wishes/{created['id']}", headers=headers).status_code == 200
    assert api_client.get(f"/api/wishes/{created['id']}/status", headers=headers).status_code == 404
    assert api_client.delete(f"/api/wishes/{created['id']}", headers=headers).status_code == 404
