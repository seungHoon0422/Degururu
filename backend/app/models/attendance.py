from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AttendanceStatus(str, enum.Enum):
    UNKNOWN = "UNKNOWN"
    ATTEND = "ATTEND"
    ABSENT = "ABSENT"


class Attendance(Base):
    __tablename__ = "attendance"
    __table_args__ = (UniqueConstraint("schedule_id", "user_id", name="uq_attendance_schedule_user"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    schedule_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("schedules.id"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    status: Mapped[AttendanceStatus] = mapped_column(Enum(AttendanceStatus, name="attendance_status"), nullable=False)
    comment: Mapped[str | None] = mapped_column(String(300), nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    schedule = relationship("Schedule", back_populates="attendances")
    user = relationship("User", back_populates="attendances")
