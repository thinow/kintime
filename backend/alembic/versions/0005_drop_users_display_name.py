"""drop users.display_name

Revision ID: 0005
Revises: 0004
Create Date: 2026-06-14

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("users", "display_name")


def downgrade() -> None:
    op.add_column(
        "users",
        sa.Column("display_name", sa.String(), nullable=True),
    )
