import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Wish, WishStatus, WishVisibility


def test_create_save_and_retrieve_wish(db_session: Session) -> None:
    wish = Wish(
        text="I wish to keep learning.",
        visibility=WishVisibility.PUBLIC,
        sky_x=24.5,
        sky_y=71.25,
        claim_token_hash="test-token-hash",
    )
    db_session.add(wish)
    db_session.commit()

    saved_wish = db_session.scalar(select(Wish).where(Wish.id == wish.id))

    assert saved_wish is not None
    assert isinstance(saved_wish.id, uuid.UUID)
    assert saved_wish.text == "I wish to keep learning."
    assert saved_wish.status is WishStatus.PENDING
    assert saved_wish.visibility is WishVisibility.PUBLIC
    assert saved_wish.created_at is not None
    assert saved_wish.granted_at is None
    assert saved_wish.sky_x == 24.5
    assert saved_wish.sky_y == 71.25
    assert saved_wish.claim_token_hash == "test-token-hash"
