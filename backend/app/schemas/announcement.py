from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    is_pinned: bool = False


class AnnouncementUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    is_pinned: bool | None = None
    is_deleted: bool | None = None


class AnnouncementRead(BaseModel):
    id: UUID
    title: str
    content: str
    author_id: UUID
    is_pinned: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
