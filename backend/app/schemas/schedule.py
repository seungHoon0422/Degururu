from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ScheduleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    location: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=10_000)


class ScheduleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    starts_at: datetime | None = None
    location: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=10_000)
    is_cancelled: bool | None = None


class ScheduleRead(BaseModel):
    id: UUID
    title: str
    starts_at: datetime
    location: str | None
    notes: str | None
    created_by: UUID | None
    is_cancelled: bool
    created_at: datetime
    updated_at: datetime
