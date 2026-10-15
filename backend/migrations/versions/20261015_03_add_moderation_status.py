"""Add wish moderation status.

Revision ID: 20261015_03
Revises: 20261015_02
Create Date: 2026-10-15
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261015_03"
down_revision: str | None = "20261015_02"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


moderation_status = sa.Enum(
    "pending",
    "approved",
    "rejected",
    name="moderation_status",
    native_enum=False,
    create_constraint=True,
)


def upgrade() -> None:
    with op.batch_alter_table("wishes") as batch_op:
        batch_op.add_column(
            sa.Column(
                "moderation_status",
                moderation_status,
                server_default="pending",
                nullable=False,
            )
        )


def downgrade() -> None:
    with op.batch_alter_table("wishes") as batch_op:
        batch_op.drop_column("moderation_status")
