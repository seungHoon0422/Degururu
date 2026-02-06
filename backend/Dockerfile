FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
# Using pip to install directly to avoid poetry complexities in docker
RUN pip install fastapi uvicorn sqlalchemy[asyncio] asyncpg pydantic-settings alembic python-jose[cryptography] passlib[bcrypt] bcrypt==4.0.1 python-multipart email-validator

COPY . .

# Migration and server start script
RUN echo '#!/bin/bash\nalembic upgrade head\npython seed.py\nuvicorn app.main:app --host 0.0.0.0 --port 8000' > /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
