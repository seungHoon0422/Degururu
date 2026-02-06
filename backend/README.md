# Degururu Backend

Backend API for Degururu Bowling Club Management System.

## Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Poetry (for dependency management)

## Setup

1. **Install dependencies**:
   ```bash
   cd backend
   poetry install
   ```

2. **Configure environment**:
   Create a `.env` file in the `backend/` directory:
   ```env
   DATABASE_DSN=postgresql+asyncpg://postgres:postgres@localhost:5432/degururu
   JWT_SECRET_KEY=your-secret-key-here-change-in-production
   ```

3. **Run database migrations**:
   ```bash
   # Apply migrations to create all tables
   poetry run alembic upgrade head
   ```

4. **Seed the database** (optional):
   ```bash
   # Populate with sample data
   poetry run python -m seed
   
   # To skip clearing existing data:
   CLEAR_DATA=false poetry run python -m seed
   ```

## Database Migrations

### Running Migrations

Apply all pending migrations:
```bash
poetry run alembic upgrade head
```

Rollback one migration:
```bash
poetry run alembic downgrade -1
```

Rollback all migrations:
```bash
poetry run alembic downgrade base
```

### Creating New Migrations

After modifying models, create a new migration:
```bash
poetry run alembic revision --autogenerate -m "Description of changes"
```

Then review the generated file in `alembic/versions/` and apply it:
```bash
poetry run alembic upgrade head
```

### Migration History

View migration history:
```bash
poetry run alembic history
```

View current migration version:
```bash
poetry run alembic current
```

## Seed Data

The seed script (`seed.py`) creates:
- **1 Admin user**: `admin@degururu.com` / `admin1234`
- **3 Member users**: 
  - `member1@gmail.com` / `member1234` (Kim Jimin - Full Member)
  - `member2@gmail.com` / `member1234` (Lee Sooyoung - Full Member)
  - `member3@gmail.com` / `member1234` (Park Minsu - Associate Member)
- **5 Saturday schedules** at 10:00 AM
- **Sample attendance** records for first 3 schedules
- **Sample scores** for first 2 schedules (3 games per member)
- **5 Announcements** (2 pinned)

### Running the Seed Script

```bash
# Clear all data and seed fresh (default)
poetry run python -m seed

# Keep existing data and add seed data
CLEAR_DATA=false poetry run python -m seed
```

## Running the Application

Start the development server:
```bash
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- OpenAPI Schema: http://localhost:8000/openapi.json

## Project Structure

```
backend/
├── alembic/              # Database migrations
│   ├── versions/         # Migration scripts
│   └── env.py           # Alembic environment config
├── app/
│   ├── api/             # API routes
│   ├── core/            # Core functionality (config, security)
│   ├── db/              # Database session management
│   ├── models/          # SQLAlchemy models
│   └── schemas/         # Pydantic schemas
├── alembic.ini          # Alembic configuration
├── seed.py              # Database seeding script
└── pyproject.toml       # Project dependencies
```

## Development

### Running Tests

```bash
poetry run pytest
```

### Code Style

This project uses standard Python formatting. Consider using:
- `black` for code formatting
- `ruff` for linting
- `mypy` for type checking

## Database Schema

### Tables

- **users**: User accounts (admin and members)
- **schedules**: Bowling session schedules
- **attendance**: Attendance tracking for each schedule
- **scores**: Bowling scores (multiple games per schedule)
- **announcements**: Club announcements and news

### Enums

- **UserRole**: ADMIN, MEMBER
- **MemberType**: FULL, ASSOCIATE
- **AttendanceStatus**: UNKNOWN, ATTEND, ABSENT

## Troubleshooting

### Migration Issues

If you encounter migration issues:

1. Check current migration state:
   ```bash
   poetry run alembic current
   ```

2. If stuck, reset to base and reapply:
   ```bash
   poetry run alembic downgrade base
   poetry run alembic upgrade head
   ```

3. For a fresh start, drop all tables and rerun:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```
   Then run migrations again.

### Connection Issues

Ensure PostgreSQL is running:
```bash
# macOS with Homebrew
brew services start postgresql@14

# Linux
sudo systemctl start postgresql
```

Verify connection:
```bash
psql -U postgres -h localhost -d degururu
```
