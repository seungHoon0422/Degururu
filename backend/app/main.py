from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import announcements, attendance, auth, schedules, scores, users
from app.core.config import get_settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title=settings.project_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    api_prefix = "/api"
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(users.router, prefix=api_prefix)
    app.include_router(schedules.router, prefix=api_prefix)
    app.include_router(attendance.router, prefix=api_prefix)
    app.include_router(scores.router, prefix=api_prefix)
    app.include_router(announcements.router, prefix=api_prefix)

    return app


app = create_app()
