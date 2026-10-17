from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.schemas import WritingFeedResponse, WritingPost
from app.substack import SubstackFeedError, get_substack_posts


router = APIRouter(prefix="/api/writing", tags=["writing"])
PostLimit = Annotated[int, Query(ge=1, le=12)]


@router.get("", response_model=WritingFeedResponse)
def get_writing_posts(limit: PostLimit = 3) -> WritingFeedResponse:
    try:
        posts = get_substack_posts()[:limit]
    except SubstackFeedError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Writing could not be loaded right now.",
        ) from error
    return WritingFeedResponse(posts=[WritingPost(**post) for post in posts])
