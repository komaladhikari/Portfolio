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
