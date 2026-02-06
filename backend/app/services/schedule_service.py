from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate


class ScheduleService:
    async def list_schedules(
        self,
        db: AsyncSession,
        *,
        page: int = 1,
        size: int = 20,
        starts_from: datetime | None = None,
        starts_to: datetime | None = None,
    ) -> tuple[list[Schedule], int]:
        stmt = select(Schedule)
        count_stmt = select(func.count()).select_from(Schedule)

        if starts_from is not None:
            stmt = stmt.where(Schedule.starts_at >= starts_from)
            count_stmt = count_stmt.where(Schedule.starts_at >= starts_from)
        if starts_to is not None:
            stmt = stmt.where(Schedule.starts_at <= starts_to)
            count_stmt = count_stmt.where(Schedule.starts_at <= starts_to)

        total = await db.scalar(count_stmt)
        result = await db.execute(stmt.order_by(Schedule.starts_at.desc()).offset((page - 1) * size).limit(size))
        return list(result.scalars().all()), int(total or 0)

    async def create_schedule(self, db: AsyncSession, *, payload: ScheduleCreate, created_by: UUID) -> Schedule:
        schedule = Schedule(
            title=payload.title,
            starts_at=payload.starts_at,
            location=payload.location,
            notes=payload.notes,
            created_by=created_by,
            is_cancelled=False,
        )
        db.add(schedule)
        await db.commit()
        await db.refresh(schedule)
        return schedule

    async def get_schedule(self, db: AsyncSession, *, schedule_id: UUID) -> Schedule:
        result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
        schedule = result.scalar_one_or_none()
        if schedule is None:
            raise HTTPException(status_code=404, detail="Schedule not found")
        return schedule

    async def update_schedule(self, db: AsyncSession, *, schedule_id: UUID, payload: ScheduleUpdate) -> Schedule:
        schedule = await self.get_schedule(db, schedule_id=schedule_id)
        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(schedule, k, v)
        await db.commit()
        await db.refresh(schedule)
        return schedule

    async def cancel_schedule(self, db: AsyncSession, *, schedule_id: UUID) -> Schedule:
        schedule = await self.get_schedule(db, schedule_id=schedule_id)
        schedule.is_cancelled = True
        await db.commit()
        await db.refresh(schedule)
        return schedule


schedule_service = ScheduleService()
