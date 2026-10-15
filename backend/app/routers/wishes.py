from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import WishCreate, WishCreated
from app.services import WishCreationError, create_wish


router = APIRouter(prefix="/api/wishes", tags=["wishes"])
DatabaseSession = Annotated[Session, Depends(get_db)]


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
