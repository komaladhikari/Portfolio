"""Create wishes table.

Revision ID: 20261015_01
Revises:
Create Date: 2026-10-15
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261015_01"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "wishes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("text", sa.String(length=180), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "granted",
                name="wish_status",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column(
            "visibility",
            sa.Enum(
                "public",
                "private",
                name="wish_visibility",
                native_enum=False,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("granted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sky_x", sa.Float(), nullable=False),
        sa.Column("sky_y", sa.Float(), nullable=False),
        sa.Column("claim_token_hash", sa.String(length=255), nullable=False),
        sa.CheckConstraint("sky_x >= 0 AND sky_x <= 100", name="ck_wishes_sky_x_range"),
        sa.CheckConstraint("sky_y >= 0 AND sky_y <= 100", name="ck_wishes_sky_y_range"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("claim_token_hash"),
    )


def downgrade() -> None:
    op.drop_table("wishes")
