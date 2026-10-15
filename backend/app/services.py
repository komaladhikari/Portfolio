import hashlib
import secrets
import uuid

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Wish, WishStatus
from app.schemas import WishCreate


class WishCreationError(Exception):
    pass


def hash_claim_token(claim_token: str) -> str:
    return hashlib.sha256(claim_token.encode("utf-8")).hexdigest()


def stable_sky_coordinates(wish_id: uuid.UUID) -> tuple[float, float]:
    coordinate_bytes = hashlib.sha256(wish_id.bytes).digest()
    x_value = int.from_bytes(coordinate_bytes[:4]) / (2**32 - 1)
    y_value = int.from_bytes(coordinate_bytes[4:8]) / (2**32 - 1)
    return 8 + (x_value * 84), 12 + (y_value * 70)


def create_wish(db: Session, wish_data: WishCreate) -> tuple[Wish, str]:
    wish_id = uuid.uuid4()
    claim_token = secrets.token_urlsafe(32)
    sky_x, sky_y = stable_sky_coordinates(wish_id)
    wish = Wish(
        id=wish_id,
        text=wish_data.text,
        status=WishStatus.PENDING,
        visibility=wish_data.visibility,
        sky_x=sky_x,
        sky_y=sky_y,
        claim_token_hash=hash_claim_token(claim_token),
    )

    try:
        db.add(wish)
        db.commit()
        db.refresh(wish)
    except SQLAlchemyError as error:
        db.rollback()
        raise WishCreationError from error

    return wish, claim_token
