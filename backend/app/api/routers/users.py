from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_current_admin, get_db_session
from app.models.user import User
from app.schemas.user import ProfileUpdate, UserCreate, UserRead, UserUpdate
from app.services.user_service import user_service

router = APIRouter(tags=["users"])


@router.get("/users", response_model=list[UserRead])
async def list_users(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> list[User]:
    items, _total = await user_service.list_users(db, page=page, size=size)
    return items


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(*, db: AsyncSession = Depends(get_db_session), _: User = Depends(get_current_admin), payload: UserCreate) -> User:
    return await user_service.create_user(db, payload=payload)


@router.get("/users/{user_id}", response_model=UserRead)
async def get_user(*, db: AsyncSession = Depends(get_db_session), _: User = Depends(get_current_admin), user_id: UUID) -> User:
    return await user_service.get_user(db, user_id=user_id)


@router.patch("/users/{user_id}", response_model=UserRead)
async def update_user(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    user_id: UUID,
    payload: UserUpdate,
) -> User:
    return await user_service.update_user(db, user_id=user_id, payload=payload)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_user(*, db: AsyncSession = Depends(get_db_session), _: User = Depends(get_current_admin), user_id: UUID) -> None:
    await user_service.deactivate_user(db, user_id=user_id)


@router.get("/profile", response_model=UserRead)
async def get_profile(*, db: AsyncSession = Depends(get_db_session), current_user: User = Depends(get_current_active_user)) -> User:
    return await user_service.get_profile(db, user_id=current_user.id)


@router.patch("/profile", response_model=UserRead)
async def update_profile(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    payload: ProfileUpdate,
) -> User:
    return await user_service.update_profile(db, user_id=current_user.id, payload=payload)
