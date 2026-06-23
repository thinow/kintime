"""add baseline_minutes to kin

Revision ID: 0007
Revises: 0006
Create Date: 2026-06-23

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("kin", sa.Column("baseline_minutes", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("kin", "baseline_minutes")
