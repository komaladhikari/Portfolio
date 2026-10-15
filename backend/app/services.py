import hashlib
import hmac
import secrets
import uuid

from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Wish, WishStatus, utc_now
from app.schemas import WishCreate


class WishCreationError(Exception):
    pass


class WishRetrievalError(Exception):
    pass


class WishNotFoundError(Exception):
    pass


class InvalidClaimTokenError(Exception):
    pass


class WishGrantError(Exception):
    pass


def hash_claim_token(claim_token: str) -> str:
    return hashlib.sha256(claim_token.encode("utf-8")).hexdigest()


def verify_claim_token(claim_token: str, expected_hash: str) -> bool:
    supplied_hash = hash_claim_token(claim_token)
    return hmac.compare_digest(supplied_hash, expected_hash)


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


def get_wish_status(db: Session, wish_id: uuid.UUID, claim_token: str) -> Wish:
    try:
        wish = db.scalar(select(Wish).where(Wish.id == wish_id))
    except SQLAlchemyError as error:
        raise WishRetrievalError from error

    if wish is None:
        raise WishNotFoundError
    if not verify_claim_token(claim_token, wish.claim_token_hash):
        raise InvalidClaimTokenError

    return wish


def grant_wish(db: Session, wish_id: uuid.UUID, claim_token: str) -> Wish:
    try:
        wish = db.scalar(select(Wish).where(Wish.id == wish_id))
        if wish is None:
            raise WishNotFoundError
        if not verify_claim_token(claim_token, wish.claim_token_hash):
            raise InvalidClaimTokenError
        if wish.status is WishStatus.GRANTED:
            return wish

        sky_x, sky_y = wish.sky_x, wish.sky_y
        if sky_x is None or sky_y is None:
            sky_x, sky_y = stable_sky_coordinates(wish.id)

        grant_time = utc_now()
        result = db.execute(
            update(Wish)
            .where(Wish.id == wish_id, Wish.status == WishStatus.PENDING)
            .values(
                status=WishStatus.GRANTED,
                granted_at=grant_time,
                sky_x=sky_x,
                sky_y=sky_y,
            )
        )
        db.commit()
        db.expire_all()

        granted_wish = db.get(Wish, wish_id)
        if granted_wish is None:
            raise WishNotFoundError
        if result.rowcount == 0 and granted_wish.status is not WishStatus.GRANTED:
            raise WishGrantError
        return granted_wish
    except (WishNotFoundError, InvalidClaimTokenError):
        raise
    except SQLAlchemyError as error:
        db.rollback()
        raise WishGrantError from error
