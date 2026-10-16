from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ModerationStatus, WishVisibility
from app.schemas import SharedSkyResponse, SkyStar
from app.services import SkyRetrievalError, list_sky_wishes


PRIVATE_WISH_MESSAGE = "Someone wished for something beautiful here."

router = APIRouter(prefix="/api/sky", tags=["sky"])
DatabaseSession = Annotated[Session, Depends(get_db)]
PageLimit = Annotated[int, Query(ge=1, le=100)]
PageOffset = Annotated[int, Query(ge=0)]


@router.get("", response_model=SharedSkyResponse)
def get_shared_sky(
    db: DatabaseSession,
    limit: PageLimit = 50,
    offset: PageOffset = 0,
) -> SharedSkyResponse:
    try:
        wishes = list_sky_wishes(db, limit, offset)
    except SkyRetrievalError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Shared Sky could not be loaded.",
        ) from error

    stars = [
        SkyStar(
            id=wish.id,
            x=wish.sky_x,
            y=wish.sky_y,
            visibility=wish.visibility,
            text=(
                wish.text
                if wish.visibility is WishVisibility.PUBLIC
                and wish.moderation_status is ModerationStatus.APPROVED
                else PRIVATE_WISH_MESSAGE
            ),
        )
        for wish in wishes
    ]
    return SharedSkyResponse(stars=stars, limit=limit, offset=offset)
