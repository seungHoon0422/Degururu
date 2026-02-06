from __future__ import annotations

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db_session
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest, LoginRequest, Token
from app.schemas.user import UserRead
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login(*, db: AsyncSession = Depends(get_db_session), payload: LoginRequest) -> Token:
    access_token = await auth_service.login(db, email=payload.email, password=payload.password)
    return Token(access_token=access_token)


@router.post("/login/oauth2", response_model=Token, include_in_schema=False)
async def login_oauth2(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_session),
) -> Token:
    access_token = await auth_service.login(db, email=form_data.username, password=form_data.password)
    return Token(access_token=access_token)


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_active_user)) -> User:
    return current_user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    payload: ChangePasswordRequest,
) -> None:
    await auth_service.change_password(
        db,
        user_id=current_user.id,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
