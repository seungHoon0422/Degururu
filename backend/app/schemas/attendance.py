from __future__ import annotations

import enum
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AttendanceStatus(str, enum.Enum):
    UNKNOWN = "UNKNOWN"
    ATTEND = "ATTEND"
    ABSENT = "ABSENT"


class AttendanceUpsert(BaseModel):
    status: AttendanceStatus
    comment: str | None = Field(default=None, max_length=300)


class AttendanceRead(BaseModel):
    id: UUID
    schedule_id: UUID
    user_id: UUID
    status: AttendanceStatus
    comment: str | None
    updated_at: datetime
