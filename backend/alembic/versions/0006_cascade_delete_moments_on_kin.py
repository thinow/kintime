"""cascade delete moments when kin is deleted

Revision ID: 0006
Revises: 0005
Create Date: 2026-06-14

"""

from typing import Sequence, Union

from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("moments_kin_id_fkey", "moments", type_="foreignkey")
    op.create_foreign_key(
        None, "moments", "kin", ["kin_id"], ["id"], ondelete="CASCADE"
    )


def downgrade() -> None:
    op.drop_constraint(None, "moments", type_="foreignkey")
    op.create_foreign_key(None, "moments", "kin", ["kin_id"], ["id"])
