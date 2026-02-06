from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, SmallInteger, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Score(Base):
    __tablename__ = "scores"
    __table_args__ = (UniqueConstraint("schedule_id", "user_id", "game_no", name="uq_score_schedule_user_game"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    schedule_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schedules.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    game_no: Mapped[int] = mapped_column(SmallInteger, nullable=False, server_default="1")
    score: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    schedule = relationship("Schedule", back_populates="scores")
    user = relationship("User", back_populates="scores")
