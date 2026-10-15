from typing import Annotated

import uuid

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import WishCreate, WishCreated, WishGranted, WishStatusResponse
from app.services import (
    InvalidClaimTokenError,
    WishCreationError,
    WishGrantError,
    WishNotFoundError,
    WishRetrievalError,
    create_wish,
    grant_wish,
    get_wish_status,
)


router = APIRouter(prefix="/api/wishes", tags=["wishes"])
DatabaseSession = Annotated[Session, Depends(get_db)]
ClaimToken = Annotated[str, Header(alias="X-Claim-Token", min_length=1, max_length=200)]


@router.post("", response_model=WishCreated, status_code=status.HTTP_201_CREATED)
def create_wish_endpoint(wish_data: WishCreate, db: DatabaseSession) -> WishCreated:
    try:
        wish, claim_token = create_wish(db, wish_data)
    except WishCreationError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Wish could not be saved.",
        ) from error

    return WishCreated(id=wish.id, claim_token=claim_token, status=wish.status)


@router.get("/{wish_id}/status", response_model=WishStatusResponse)
def get_wish_status_endpoint(
    wish_id: uuid.UUID,
    claim_token: ClaimToken,
    db: DatabaseSession,
) -> WishStatusResponse:
    try:
        wish = get_wish_status(db, wish_id, claim_token)
    except WishNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wish not found.",
        ) from error
    except InvalidClaimTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid claim token.",
        ) from error
    except WishRetrievalError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Wish status could not be retrieved.",
        ) from error

    return WishStatusResponse(
        id=wish.id,
        status=wish.status,
        created_at=wish.created_at,
        granted_at=wish.granted_at,
    )


@router.post("/{wish_id}/grant", response_model=WishGranted)
def grant_wish_endpoint(
    wish_id: uuid.UUID,
    claim_token: ClaimToken,
    db: DatabaseSession,
) -> WishGranted:
    try:
        wish = grant_wish(db, wish_id, claim_token)
    except WishNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wish not found.",
        ) from error
    except InvalidClaimTokenError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid claim token.",
        ) from error
    except WishGrantError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Wish could not be granted.",
        ) from error

    return WishGranted(
        id=wish.id,
        status=wish.status,
        granted_at=wish.granted_at,
    )
