from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_current_admin, get_db_session
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.attendance import AttendanceRead, AttendanceUpsert
from app.services.attendance_service import attendance_service

router = APIRouter(tags=["attendance"])


@router.get("/schedules/{schedule_id}/attendance", response_model=list[AttendanceRead])
async def list_schedule_attendance(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    schedule_id: UUID,
) -> list[Attendance]:
    return await attendance_service.list_schedule_attendance(db, schedule_id=schedule_id)


@router.put("/schedules/{schedule_id}/attendance/me", response_model=AttendanceRead)
async def my_checkin(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    schedule_id: UUID,
    payload: AttendanceUpsert,
) -> Attendance:
    return await attendance_service.upsert_attendance_for_user(db, schedule_id=schedule_id, user_id=current_user.id, payload=payload)


@router.put("/schedules/{schedule_id}/attendance/{user_id}", response_model=AttendanceRead)
async def admin_set_attendance(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    schedule_id: UUID,
    user_id: UUID,
    payload: AttendanceUpsert,
) -> Attendance:
    return await attendance_service.upsert_attendance_for_user(db, schedule_id=schedule_id, user_id=user_id, payload=payload)
