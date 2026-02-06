from __future__ import annotations

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_current_admin, get_db_session
from app.models.schedule import Schedule
from app.models.user import User
from app.schemas.schedule import ScheduleCreate, ScheduleRead, ScheduleUpdate
from app.services.schedule_service import schedule_service

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.get("", response_model=list[ScheduleRead])
async def list_schedules(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    starts_from: datetime | None = Query(default=None),
    starts_to: datetime | None = Query(default=None),
) -> list[Schedule]:
    items, _total = await schedule_service.list_schedules(db, page=page, size=size, starts_from=starts_from, starts_to=starts_to)
    return items


@router.post("", response_model=ScheduleRead, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_admin: User = Depends(get_current_admin),
    payload: ScheduleCreate,
) -> Schedule:
    return await schedule_service.create_schedule(db, payload=payload, created_by=current_admin.id)


@router.get("/{schedule_id}", response_model=ScheduleRead)
async def get_schedule(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    schedule_id: UUID,
) -> Schedule:
    return await schedule_service.get_schedule(db, schedule_id=schedule_id)


@router.patch("/{schedule_id}", response_model=ScheduleRead)
async def update_schedule(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    schedule_id: UUID,
    payload: ScheduleUpdate,
) -> Schedule:
    return await schedule_service.update_schedule(db, schedule_id=schedule_id, payload=payload)


@router.delete("/{schedule_id}", response_model=ScheduleRead)
async def cancel_schedule(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_admin),
    schedule_id: UUID,
) -> Schedule:
    return await schedule_service.cancel_schedule(db, schedule_id=schedule_id)
