from datetime import datetime
from typing import Annotated
import uuid

from pydantic import BaseModel, StringConstraints

from app.models import WishStatus, WishVisibility


WishText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]


class WishCreate(BaseModel):
    text: WishText
    visibility: WishVisibility


class WishCreated(BaseModel):
    id: uuid.UUID
    claim_token: str
    status: WishStatus


class WishStatusResponse(BaseModel):
    id: uuid.UUID
    status: WishStatus
    created_at: datetime
    granted_at: datetime | None


class WishGranted(BaseModel):
    id: uuid.UUID
    status: WishStatus
    granted_at: datetime


class SkyStar(BaseModel):
    id: uuid.UUID
    x: float
    y: float
    visibility: WishVisibility
    text: str


class SharedSkyResponse(BaseModel):
    stars: list[SkyStar]
    limit: int
    offset: int
