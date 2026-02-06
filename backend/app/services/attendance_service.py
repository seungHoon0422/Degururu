from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance import Attendance, AttendanceStatus
from app.models.schedule import Schedule
from app.schemas.attendance import AttendanceUpsert


class AttendanceService:
    async def list_schedule_attendance(self, db: AsyncSession, *, schedule_id: UUID) -> list[Attendance]:
        await self._ensure_schedule_exists(db, schedule_id=schedule_id)
        result = await db.execute(select(Attendance).where(Attendance.schedule_id == schedule_id).order_by(Attendance.updated_at.desc()))
        return list(result.scalars().all())

    async def upsert_attendance_for_user(
        self,
        db: AsyncSession,
        *,
        schedule_id: UUID,
        user_id: UUID,
        payload: AttendanceUpsert,
    ) -> Attendance:
        await self._ensure_schedule_exists(db, schedule_id=schedule_id)

        result = await db.execute(select(Attendance).where(Attendance.schedule_id == schedule_id, Attendance.user_id == user_id))
        attendance = result.scalar_one_or_none()

        if attendance is None:
            attendance = Attendance(
                schedule_id=schedule_id,
                user_id=user_id,
                status=payload.status,
                comment=payload.comment,
            )
            db.add(attendance)
        else:
            attendance.status = payload.status
            attendance.comment = payload.comment

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=409, detail="Attendance conflict")

        await db.refresh(attendance)
        return attendance

    async def get_my_attendance(self, db: AsyncSession, *, user_id: UUID, page: int = 1, size: int = 20) -> tuple[list[Attendance], int]:
        total = await db.scalar(select(func.count()).select_from(Attendance).where(Attendance.user_id == user_id))
        result = await db.execute(
            select(Attendance)
            .where(Attendance.user_id == user_id)
            .order_by(Attendance.updated_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
        return list(result.scalars().all()), int(total or 0)

    async def _ensure_schedule_exists(self, db: AsyncSession, *, schedule_id: UUID) -> None:
        exists = await db.scalar(select(func.count()).select_from(Schedule).where(Schedule.id == schedule_id))
        if not exists:
            raise HTTPException(status_code=404, detail="Schedule not found")

    async def set_unknown_if_missing(self, db: AsyncSession, *, schedule_id: UUID, user_id: UUID) -> Attendance:
        result = await db.execute(select(Attendance).where(Attendance.schedule_id == schedule_id, Attendance.user_id == user_id))
        attendance = result.scalar_one_or_none()
        if attendance is not None:
            return attendance

        attendance = Attendance(schedule_id=schedule_id, user_id=user_id, status=AttendanceStatus.UNKNOWN, comment=None)
        db.add(attendance)
        await db.commit()
        await db.refresh(attendance)
        return attendance


attendance_service = AttendanceService()
