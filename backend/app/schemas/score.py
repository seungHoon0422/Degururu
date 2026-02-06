from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ScoreCreate(BaseModel):
    schedule_id: UUID
    game_no: int = Field(default=1, ge=1)
    score: int = Field(ge=0, le=300)


class ScoreUpdate(BaseModel):
    game_no: int | None = Field(default=None, ge=1)
    score: int | None = Field(default=None, ge=0, le=300)


class ScoreRead(BaseModel):
    id: UUID
    schedule_id: UUID
    user_id: UUID
    game_no: int
    score: int
    created_at: datetime
