"""Initial migration

Revision ID: 001_initial
Revises: 
Create Date: 2026-02-06 21:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enums
    op.execute("CREATE TYPE user_role AS ENUM ('ADMIN', 'MEMBER')")
    op.execute("CREATE TYPE member_type AS ENUM ('FULL', 'ASSOCIATE')")
    op.execute("CREATE TYPE attendance_status AS ENUM ('UNKNOWN', 'ATTEND', 'ABSENT')")

    # Create users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('role', postgresql.ENUM('ADMIN', 'MEMBER', name='user_role', create_type=False), nullable=False),
        sa.Column('member_type', postgresql.ENUM('FULL', 'ASSOCIATE', name='member_type', create_type=False), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create schedules table
    op.create_table('schedules',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('location', sa.String(length=200), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_cancelled', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create attendance table
    op.create_table('attendance',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('schedule_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', postgresql.ENUM('UNKNOWN', 'ATTEND', 'ABSENT', name='attendance_status', create_type=False), nullable=False),
        sa.Column('comment', sa.String(length=300), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['schedule_id'], ['schedules.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('schedule_id', 'user_id', name='uq_attendance_schedule_user')
    )

    # Create scores table
    op.create_table('scores',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('schedule_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('game_no', sa.SmallInteger(), server_default='1', nullable=False),
        sa.Column('score', sa.SmallInteger(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['schedule_id'], ['schedules.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('schedule_id', 'user_id', 'game_no', name='uq_score_schedule_user_game')
    )

    # Create announcements table
    op.create_table('announcements',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('author_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_pinned', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('announcements')
    op.drop_table('scores')
    op.drop_table('attendance')
    op.drop_table('schedules')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    
    # Drop enums
    op.execute("DROP TYPE IF EXISTS attendance_status")
    op.execute("DROP TYPE IF EXISTS member_type")
    op.execute("DROP TYPE IF EXISTS user_role")
