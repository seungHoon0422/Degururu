from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User


class AuthService:
    async def login(self, db: AsyncSession, *, email: str, password: str) -> str:
        email_normalized = email.lower().strip()

        result = await db.execute(select(User).where(User.email == email_normalized))
        user = result.scalar_one_or_none()

        if user is None or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect email or password")
        if not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user")

        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()

        return create_access_token(str(user.id), extra_claims={"role": user.role.value})

    async def change_password(self, db: AsyncSession, *, user_id: UUID, current_password: str, new_password: str) -> None:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(current_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        user.password_hash = get_password_hash(new_password)
        await db.commit()


auth_service = AuthService()
