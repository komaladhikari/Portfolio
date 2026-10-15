import uuid

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models import (
    ModerationStatus,
    Wish,
    WishStatus,
    WishVisibility,
    utc_now,
)
from app.routers.sky import PRIVATE_WISH_MESSAGE


def add_wish(
    db: Session,
    *,
    text: str,
    status: WishStatus = WishStatus.GRANTED,
    visibility: WishVisibility = WishVisibility.PUBLIC,
    moderation_status: ModerationStatus = ModerationStatus.APPROVED,
) -> Wish:
    wish = Wish(
        text=text,
        status=status,
        visibility=visibility,
        moderation_status=moderation_status,
        granted_at=utc_now() if status is WishStatus.GRANTED else None,
        sky_x=25.0,
        sky_y=75.0,
        claim_token_hash=f"hash-{uuid.uuid4()}",
    )
    db.add(wish)
    db.commit()
    db.refresh(wish)
    return wish


def test_shared_sky_returns_approved_public_text(
    api_client: TestClient,
    db_session: Session,
) -> None:
    wish = add_wish(db_session, text="I wish for clear skies.")

    response = api_client.get("/api/sky")

    assert response.status_code == 200
    assert response.json() == {
        "stars": [
            {
                "id": str(wish.id),
                "x": 25.0,
                "y": 75.0,
                "visibility": "public",
                "text": "I wish for clear skies.",
            }
        ],
        "limit": 50,
        "offset": 0,
    }


def test_shared_sky_redacts_private_and_unapproved_text(
    api_client: TestClient,
    db_session: Session,
) -> None:
    add_wish(
        db_session,
        text="private-sensitive-text",
        visibility=WishVisibility.PRIVATE,
    )
    add_wish(
        db_session,
        text="unapproved-sensitive-text",
        moderation_status=ModerationStatus.PENDING,
    )

    response = api_client.get("/api/sky")

    assert response.status_code == 200
    assert len(response.json()["stars"]) == 2
    assert all(
        star["text"] == PRIVATE_WISH_MESSAGE for star in response.json()["stars"]
    )
    assert "private-sensitive-text" not in response.text
    assert "unapproved-sensitive-text" not in response.text


def test_shared_sky_excludes_pending_wishes(
    api_client: TestClient,
    db_session: Session,
) -> None:
    add_wish(db_session, text="pending-secret", status=WishStatus.PENDING)

    response = api_client.get("/api/sky")

    assert response.status_code == 200
    assert response.json()["stars"] == []
    assert "pending-secret" not in response.text


def test_shared_sky_paginates_results(
    api_client: TestClient,
    db_session: Session,
) -> None:
    for index in range(3):
        add_wish(db_session, text=f"Wish {index}")

    first_page = api_client.get("/api/sky?limit=2&offset=0")
    second_page = api_client.get("/api/sky?limit=2&offset=2")

    assert first_page.status_code == 200
    assert second_page.status_code == 200
    assert len(first_page.json()["stars"]) == 2
    assert len(second_page.json()["stars"]) == 1
    first_ids = {star["id"] for star in first_page.json()["stars"]}
    second_ids = {star["id"] for star in second_page.json()["stars"]}
    assert first_ids.isdisjoint(second_ids)
    assert first_page.json()["limit"] == 2
    assert second_page.json()["offset"] == 2


def test_shared_sky_never_exposes_sensitive_fields(
    api_client: TestClient,
    db_session: Session,
) -> None:
    wish = add_wish(db_session, text="A safe public wish")

    response = api_client.get("/api/sky")

    assert response.status_code == 200
    star = response.json()["stars"][0]
    assert set(star) == {"id", "x", "y", "visibility", "text"}
    assert wish.claim_token_hash not in response.text
    assert "claim_token" not in response.text
