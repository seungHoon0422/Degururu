# Draft: Degururu Full Implementation

## Requirements (confirmed)
- **Project Type**: Greenfield - complete bowling club management site
- **Tech Stack**: 
  - Frontend: React 18+ / Vite / TypeScript / TanStack Query / Recharts / Tailwind CSS
  - Backend: Python 3.11+ / FastAPI / SQLAlchemy 2.0 (async) / Alembic
  - DB: PostgreSQL 15+
  - Auth: JWT with bcrypt hashing
- **Scope**: Full implementation of all features from design.md
- **Deliverables**: Backend API + Frontend SPA + Docker setup + Seed script

## Technical Decisions
- **Directory Structure**: Backend and frontend as separate top-level directories
- **Database**: PostgreSQL via Docker Compose
- **Testing approach**: Seed script for manual testing (docker-compose + uvicorn + npm dev)
- **Score validation**: 0-300 range
- **Password validation**: Min 8 characters, bcrypt hashed
- **IDs**: UUID for all primary keys

## Research Findings
- Design doc is comprehensive with complete ERD and API specifications
- All endpoints are clearly defined with RBAC (Admin/Member)
- Frontend component structure is well-defined

## Decisions Made (User Confirmed)
1. **Test Infrastructure**: ✅ TDD approach - pytest (backend), vitest (frontend)
2. **Attendance Self-Check**: ✅ Members can check their OWN attendance via PUT /api/schedules/{id}/attendance/me
3. **Multiple Games**: ✅ Full game_no support (1, 2, 3...) per schedule
4. **Profile Email Change**: ✅ Email CAN be changed (with uniqueness validation)
5. **Announcement Posting**: ✅ All members can create announcements (owners + admin can edit/delete)
6. **UI Framework**: ✅ Tailwind CSS only (custom components, no library)

## TDD Workflow Details (User Confirmed)
- **Backend**: pytest + pytest-asyncio for async tests
  - Test Scope: Unit tests for services + Integration tests for API endpoints
- **Frontend**: vitest + @testing-library/react
  - Test Scope: API client + Custom hooks + Key components
- **Coverage Target**: No specific requirement (focus on meaningful tests)
- **E2E Tests**: Not included (can add later if needed)

## Scope Boundaries
- INCLUDE: Complete CRUD for all entities, JWT auth, RBAC, seed script, Docker setup, TDD test infrastructure
- EXCLUDE: Tournament implementation (UI mockup only), refresh tokens (access token only), advanced analytics beyond basic charts, E2E tests with Playwright (if not requested)
