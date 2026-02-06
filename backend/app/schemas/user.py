from __future__ import annotations

import enum
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"


class MemberType(str, enum.Enum):
    FULL = "FULL"
    ASSOCIATE = "ASSOCIATE"


class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    role: UserRole
    member_type: MemberType | None = None
    description: str | None = Field(default=None, max_length=10_000)
    is_active: bool = True

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> EmailStr:
        return EmailStr(str(v).lower())


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=1, max_length=100)
    role: UserRole
    member_type: MemberType | None = None
    description: str | None = Field(default=None, max_length=10_000)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: EmailStr) -> EmailStr:
        return EmailStr(str(v).lower())

    @field_validator("member_type")
    @classmethod
    def require_member_type_for_members(cls, v: MemberType | None, info):
        role = info.data.get("role")
        if role == UserRole.MEMBER and v is None:
            raise ValueError("member_type is required when role=MEMBER")
        if role == UserRole.ADMIN and v is not None:
            raise ValueError("member_type must be null when role=ADMIN")
        return v


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    role: UserRole | None = None
    member_type: MemberType | None = None
    description: str | None = Field(default=None, max_length=10_000)
    is_active: bool | None = None


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: UserRole
    member_type: MemberType | None
    description: str | None
    is_active: bool
    last_login_at: datetime | None
    created_at: datetime
    updated_at: datetime


class ProfileUpdate(BaseModel):
    description: str | None = Field(default=None, max_length=10_000)
