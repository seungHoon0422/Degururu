from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate, AnnouncementUpdate


class AnnouncementService:
    async def list_announcements(self, db: AsyncSession, *, page: int = 1, size: int = 20) -> tuple[list[Announcement], int]:
        base_filter = Announcement.is_deleted.is_(False)

        total = await db.scalar(select(func.count()).select_from(Announcement).where(base_filter))
        stmt = (
            select(Announcement)
            .where(base_filter)
            .order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all()), int(total or 0)

    async def create_announcement(self, db: AsyncSession, *, author_id: UUID, payload: AnnouncementCreate) -> Announcement:
        announcement = Announcement(
            title=payload.title,
            content=payload.content,
            author_id=author_id,
            is_pinned=payload.is_pinned,
            is_deleted=False,
        )
        db.add(announcement)
        await db.commit()
        await db.refresh(announcement)
        return announcement

    async def get_announcement(self, db: AsyncSession, *, announcement_id: UUID) -> Announcement:
        result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
        announcement = result.scalar_one_or_none()
        if announcement is None or announcement.is_deleted:
            raise HTTPException(status_code=404, detail="Announcement not found")
        return announcement

    async def update_announcement(self, db: AsyncSession, *, announcement_id: UUID, payload: AnnouncementUpdate) -> Announcement:
        announcement = await self.get_announcement(db, announcement_id=announcement_id)

        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(announcement, k, v)

        await db.commit()
        await db.refresh(announcement)
        return announcement

    async def delete_announcement(self, db: AsyncSession, *, announcement_id: UUID) -> Announcement:
        announcement = await self.get_announcement(db, announcement_id=announcement_id)
        announcement.is_deleted = True
        await db.commit()
        await db.refresh(announcement)
        return announcement


announcement_service = AnnouncementService()
