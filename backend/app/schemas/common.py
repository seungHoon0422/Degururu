from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class Pagination(APIModel):
    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)


class PageMeta(APIModel):
    page: int
    size: int
    total: int


class ErrorResponse(APIModel):
    detail: str


class Timestamped(APIModel):
    created_at: datetime
    updated_at: datetime


class UUIDModel(APIModel):
    id: UUID
