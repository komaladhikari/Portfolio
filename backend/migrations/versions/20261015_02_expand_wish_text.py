"""Expand wish text to 200 characters.

Revision ID: 20261015_02
Revises: 20261015_01
Create Date: 2026-10-15
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20261015_02"
down_revision: str | None = "20261015_01"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    with op.batch_alter_table("wishes") as batch_op:
        batch_op.alter_column(
            "text",
            existing_type=sa.String(length=180),
            type_=sa.String(length=200),
            existing_nullable=False,
        )


def downgrade() -> None:
    with op.batch_alter_table("wishes") as batch_op:
        batch_op.alter_column(
            "text",
            existing_type=sa.String(length=200),
            type_=sa.String(length=180),
            existing_nullable=False,
        )
