"""Add status to Item

Revision ID: 3c9e1f2b7a41
Revises: fe56fa70289e
Create Date: 2026-10-21 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3c9e1f2b7a41'
down_revision = 'fe56fa70289e'
branch_labels = None
depends_on = None

itemstatus = sa.Enum('todo', 'in_progress', 'done', name='itemstatus')


def upgrade():
    itemstatus.create(op.get_bind(), checkfirst=True)
    op.add_column('item', sa.Column('status', itemstatus, nullable=False, server_default='todo'))


def downgrade():
    op.drop_column('item', 'status')
    itemstatus.drop(op.get_bind(), checkfirst=True)
