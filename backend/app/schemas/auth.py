from __future__ import annotations

from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = Field(default="bearer")


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)
