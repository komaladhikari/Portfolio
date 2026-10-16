import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, Enum, Float, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class WishStatus(str, enum.Enum):
    PENDING = "pending"
    GRANTED = "granted"


class WishVisibility(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class ModerationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Wish(Base):
    __tablename__ = "wishes"
    __table_args__ = (
        CheckConstraint("sky_x >= 0 AND sky_x <= 100", name="ck_wishes_sky_x_range"),
        CheckConstraint("sky_y >= 0 AND sky_y <= 100", name="ck_wishes_sky_y_range"),
    )

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    text: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[WishStatus] = mapped_column(
        Enum(
            WishStatus,
            name="wish_status",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda values: [value.value for value in values],
        ),
        default=WishStatus.PENDING,
        nullable=False,
    )
    visibility: Mapped[WishVisibility] = mapped_column(
        Enum(
            WishVisibility,
            name="wish_visibility",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda values: [value.value for value in values],
        ),
        nullable=False,
    )
    moderation_status: Mapped[ModerationStatus] = mapped_column(
        Enum(
            ModerationStatus,
            name="moderation_status",
            native_enum=False,
            create_constraint=True,
            values_callable=lambda values: [value.value for value in values],
        ),
        default=ModerationStatus.PENDING,
        server_default=ModerationStatus.PENDING.value,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    granted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sky_x: Mapped[float] = mapped_column(Float, nullable=False)
    sky_y: Mapped[float] = mapped_column(Float, nullable=False)
    claim_token_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
