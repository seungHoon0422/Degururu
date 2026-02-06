from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import Schedule
from app.models.score import Score
from app.schemas.score import ScoreCreate, ScoreUpdate


class ScoreService:
    async def list_schedule_scores(self, db: AsyncSession, *, schedule_id: UUID) -> list[Score]:
        await self._ensure_schedule_exists(db, schedule_id=schedule_id)
        result = await db.execute(
            select(Score).where(Score.schedule_id == schedule_id).order_by(Score.user_id.asc(), Score.game_no.asc())
        )
        return list(result.scalars().all())

    async def create_my_score(self, db: AsyncSession, *, schedule_id: UUID, user_id: UUID, payload: ScoreCreate) -> Score:
        if payload.schedule_id != schedule_id:
            raise HTTPException(status_code=400, detail="schedule_id mismatch")

        await self._ensure_schedule_exists(db, schedule_id=schedule_id)

        # Check if a score already exists with the same user_id, schedule_id, and game_no
        result = await db.execute(
            select(Score).where(
                Score.schedule_id == schedule_id,
                Score.user_id == user_id,
                Score.game_no == payload.game_no
            )
        )
        existing_score = result.scalar_one_or_none()

        if existing_score:
            # Update existing score
            existing_score.score = payload.score
            score = existing_score
        else:
            # Create new score
            score = Score(schedule_id=schedule_id, user_id=user_id, game_no=payload.game_no, score=payload.score)
            db.add(score)

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=409, detail="Score conflict")

        await db.refresh(score)
        return score

    async def update_score(self, db: AsyncSession, *, score_id: UUID, actor_user_id: UUID, is_admin: bool, payload: ScoreUpdate) -> Score:
        score = await self.get_score(db, score_id=score_id)
        if not is_admin and score.user_id != actor_user_id:
            raise HTTPException(status_code=403, detail="Not permitted")

        data = payload.model_dump(exclude_unset=True)
        for k, v in data.items():
            setattr(score, k, v)

        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=409, detail="Score conflict")

        await db.refresh(score)
        return score

    async def delete_score(self, db: AsyncSession, *, score_id: UUID, actor_user_id: UUID, is_admin: bool) -> None:
        score = await self.get_score(db, score_id=score_id)
        if not is_admin and score.user_id != actor_user_id:
            raise HTTPException(status_code=403, detail="Not permitted")

        await db.delete(score)
        await db.commit()

    async def get_score(self, db: AsyncSession, *, score_id: UUID) -> Score:
        result = await db.execute(select(Score).where(Score.id == score_id))
        score = result.scalar_one_or_none()
        if score is None:
            raise HTTPException(status_code=404, detail="Score not found")
        return score

    async def get_schedule_stats(self, db: AsyncSession, *, schedule_id: UUID) -> dict[str, float | int | None]:
        await self._ensure_schedule_exists(db, schedule_id=schedule_id)

        stmt = (
            select(func.avg(Score.score), func.min(Score.score), func.max(Score.score), func.count())
            .where(Score.schedule_id == schedule_id)
            .select_from(Score)
        )
        row = (await db.execute(stmt)).one()
        avg_score, min_score, max_score, count = row

        return {
            "average": float(avg_score) if avg_score is not None else None,
            "min": int(min_score) if min_score is not None else None,
            "max": int(max_score) if max_score is not None else None,
            "count": int(count or 0),
        }

    async def get_all_time_high(self, db: AsyncSession, *, user_id: UUID) -> int:
        result = await db.execute(
            select(func.max(Score.score)).where(Score.user_id == user_id)
        )
        val = result.scalar()
        return int(val) if val is not None else 0

    async def get_my_trend(self, db: AsyncSession, *, user_id: UUID, limit: int = 50) -> list[dict[str, object]]:
        stmt = (
            select(
                Score.schedule_id, 
                func.avg(Score.score).label("average"), 
                func.max(Score.score).label("highest"),
                func.min(Schedule.starts_at).label("starts_at"),
                func.min(Schedule.title).label("title")
            )
            .join(Schedule, Schedule.id == Score.schedule_id)
            .where(Score.user_id == user_id)
            .group_by(Score.schedule_id)
            .order_by(func.min(Schedule.starts_at).desc())
            .limit(limit)
        )
        result = await db.execute(stmt)

        items: list[dict[str, object]] = []
        for row in result.all():
            items.append(
                {
                    "schedule_id": row.schedule_id,
                    "starts_at": row.starts_at,
                    "title": row.title,
                    "average": float(row.average) if row.average is not None else None,
                    "highest": int(row.highest) if row.highest is not None else None,
                }
            )
        return items

    async def _ensure_schedule_exists(self, db: AsyncSession, *, schedule_id: UUID) -> None:
        exists = await db.scalar(select(func.count()).select_from(Schedule).where(Schedule.id == schedule_id))
        if not exists:
            raise HTTPException(status_code=404, detail="Schedule not found")


score_service = ScoreService()
