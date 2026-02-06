from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_current_admin, get_db_session
from app.models.announcement import Announcement
from app.models.user import User
from app.schemas.announcement import AnnouncementCreate, AnnouncementRead, AnnouncementUpdate
from app.services.announcement_service import announcement_service

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("", response_model=list[AnnouncementRead])
async def list_announcements(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
) -> list[Announcement]:
    items, _total = await announcement_service.list_announcements(db, page=page, size=size)
    return items


@router.post("", response_model=AnnouncementRead, status_code=status.HTTP_201_CREATED)
async def create_announcement(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_admin: User = Depends(get_current_admin),
    payload: AnnouncementCreate,
) -> Announcement:
    return await announcement_service.create_announcement(db, author_id=current_admin.id, payload=payload)


@router.get("/{announcement_id}", response_model=AnnouncementRead)
async def get_announcement(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    announcement_id: UUID,
) -> Announcement:
    return await announcement_service.get_announcement(db, announcement_id=announcement_id)


@router.patch("/{announcement_id}", response_model=AnnouncementRead)
async def update_announcement(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    announcement_id: UUID,
    payload: AnnouncementUpdate,
) -> Announcement:
    return await announcement_service.update_announcement(db, announcement_id=announcement_id, payload=payload)


@router.delete("/{announcement_id}", response_model=AnnouncementRead)
async def delete_announcement(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    announcement_id: UUID,
) -> Announcement:
    return await announcement_service.delete_announcement(db, announcement_id=announcement_id)
