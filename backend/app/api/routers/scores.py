from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_active_user, get_db_session
from app.models.score import Score
from app.models.user import User
from app.schemas.score import ScoreCreate, ScoreRead, ScoreUpdate
from app.services.score_service import score_service

router = APIRouter(tags=["scores"])


@router.get("/schedules/{schedule_id}/scores", response_model=list[ScoreRead])
async def list_schedule_scores(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    schedule_id: UUID,
) -> list[Score]:
    return await score_service.list_schedule_scores(db, schedule_id=schedule_id)


@router.post("/schedules/{schedule_id}/scores", response_model=ScoreRead, status_code=status.HTTP_201_CREATED)
async def create_my_score(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    schedule_id: UUID,
    payload: ScoreCreate,
) -> Score:
    return await score_service.create_my_score(db, schedule_id=schedule_id, user_id=current_user.id, payload=payload)


@router.patch("/scores/{score_id}", response_model=ScoreRead)
async def update_score(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    score_id: UUID,
    payload: ScoreUpdate,
) -> Score:
    is_admin = current_user.role.value == "ADMIN"
    return await score_service.update_score(db, score_id=score_id, actor_user_id=current_user.id, is_admin=is_admin, payload=payload)


@router.delete("/scores/{score_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_score(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    score_id: UUID,
) -> None:
    is_admin = current_user.role.value == "ADMIN"
    await score_service.delete_score(db, score_id=score_id, actor_user_id=current_user.id, is_admin=is_admin)


@router.get("/scores/me/trend")
async def my_trend(
    *,
    db: AsyncSession = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    limit: int = Query(50, ge=1, le=200),
) -> list[dict[str, object]]:
    return await score_service.get_my_trend(db, user_id=current_user.id, limit=limit)


@router.get("/schedules/{schedule_id}/stats")
async def schedule_stats(
    *,
    db: AsyncSession = Depends(get_db_session),
    _: User = Depends(get_current_active_user),
    schedule_id: UUID,
) -> dict[str, float | int | None]:
    return await score_service.get_schedule_stats(db, schedule_id=schedule_id)
