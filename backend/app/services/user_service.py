from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.user import ProfileUpdate, UserCreate, UserUpdate


class UserService:
    async def list_users(self, db: AsyncSession, *, page: int = 1, size: int = 20) -> tuple[list[User], int]:
        total = await db.scalar(select(func.count()).select_from(User))
        result = await db.execute(select(User).order_by(User.created_at.desc()).offset((page - 1) * size).limit(size))
        return list(result.scalars().all()), int(total or 0)

    async def create_user(self, db: AsyncSession, *, payload: UserCreate) -> User:
        user = User(
            email=str(payload.email).lower(),
            password_hash=get_password_hash(payload.password),
            name=payload.name,
            role=payload.role,
            member_type=payload.member_type,
            description=payload.description,
            is_active=True,
        )
        db.add(user)

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=409, detail="Email already exists")

        await db.refresh(user)
        return user

    async def get_user(self, db: AsyncSession, *, user_id: UUID) -> User:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    async def update_user(self, db: AsyncSession, *, user_id: UUID, payload: UserUpdate) -> User:
        user = await self.get_user(db, user_id=user_id)

        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(user, k, v)

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=409, detail="Update conflict")

        await db.refresh(user)
        return user

    async def deactivate_user(self, db: AsyncSession, *, user_id: UUID) -> None:
        user = await self.get_user(db, user_id=user_id)
        user.is_active = False
        await db.commit()

    async def get_profile(self, db: AsyncSession, *, user_id: UUID) -> User:
        return await self.get_user(db, user_id=user_id)

    async def update_profile(self, db: AsyncSession, *, user_id: UUID, payload: ProfileUpdate) -> User:
        user = await self.get_user(db, user_id=user_id)
        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(user, k, v)
        await db.commit()
        await db.refresh(user)
        return user


user_service = UserService()
