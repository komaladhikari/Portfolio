"""Auto-approve public wishes.

Revision ID: 20261015_04
Revises: 20261015_03
Create Date: 2026-10-15
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261015_04"
down_revision: str | None = "20261015_03"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    wishes = sa.table(
        "wishes",
        sa.column("visibility", sa.String()),
        sa.column("moderation_status", sa.String()),
    )
    op.execute(
        wishes.update()
        .where(
            wishes.c.visibility == "public",
            wishes.c.moderation_status == "pending",
        )
        .values(moderation_status="approved")
    )


def downgrade() -> None:
    # Approval history cannot distinguish automatic from manual approval, so a
    # downgrade intentionally avoids destructively changing existing wishes.
    pass
