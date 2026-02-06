# 🎳 데구르르 (Degururu) - 볼링 동아리 관리 시스템

데구르르 볼링 동아리의 회원, 일정, 출석, 점수, 공지사항을 관리하는 통합 웹 플랫폼입니다.

## 🚀 주요 기능

### 👤 회원 관리
- **로그인/프로필**: 이메일 기반 로그인, 비밀번호 변경, 프로필 소개 수정.
- **회원 구분**: 관리자, 정회원, 준회원.
- **관리자 전용**: 회원 추가, 정보 수정, 비활성화/삭제.

### 📅 일정 및 출석
- **일정 관리**: 관리자가 정기전/대회 일정 등록 (기본 토요일 오전 10시).
- **자가 출석**: 회원이 등록된 일정에 대해 출석 여부(참석/불참) 체크.
- **관리자 매트릭스**: 전체 회원의 출석 현황을 한눈에 보고 관리자가 직접 수정 가능.

### 📊 점수 및 통계
- **점수 기록**: 일정별 다중 게임 점수(0~300점) 기록.
- **차트 대시보드**: 개인별 점수 추이 그래프 및 일정별 평균 점수 시각화.

### 📢 공지사항
- **공지판**: 클럽 주요 소식 전달. 관리자 작성 및 상단 고정 기능.

---

## 🛠 기술 스택

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM**: SQLAlchemy 2.0 (Async)
- **Database**: PostgreSQL 15
- **Migration**: Alembic
- **Auth**: JWT (bcrypt hashing)

### Frontend
- **Framework**: React 18 (Vite + TS)
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query (v5)
- **Charts**: Recharts
- **Icons**: Lucide React

---

## 🏗 시작하기 (Setup)

### 1. 인프라 실행 (Docker)
PostgreSQL 데이터베이스를 실행합니다. (5433 포트 사용)
```bash
docker-compose up -d
```

### 2. 백엔드 설정
```bash
cd backend
# 의존성 설치 (poetry 권장)
poetry install

# DB 마이그레이션 (테이블 생성)
poetry run alembic upgrade head

# 테스트 데이터 삽입 (Seed)
poetry run python -m seed

# 서버 실행
poetry run uvicorn app.main:app --reload --port 8000
```

### 3. 프론트엔드 설정
```bash
cd frontend
# 의존성 설치
npm install

# 서버 실행
npm run dev
```
접속 주소: `http://localhost:3000` (Vite 기본 설정에 따라 다를 수 있음)

---

## 🧪 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| **관리자** | `admin@degururu.com` | `admin1234` |
| **회원 1** | `member1@gmail.com` | `member1234` |
| **회원 2** | `member2@gmail.com` | `member1234` |

---

## 📁 디렉토리 구조

### Backend
- `app/models`: SQLAlchemy 비동기 모델
- `app/schemas`: Pydantic 데이터 검증 모델
- `app/services`: 비즈니스 로직 (CRUD, 통계 계산)
- `app/api/routers`: 도메인별 API 엔드포인트
- `seed.py`: 테스트 데이터 생성 스크립트

### Frontend
- `src/app`: 라우터, 인증 가드, API 클라이언트
- `src/pages`: 일반/관리자 페이지 컴포넌트
- `src/components`: 차트, 레이아웃, 공용 UI 컴포넌트
- `src/api`: 도메인별 API 연동 함수

---

## 📝 설계 결정 사항 (Notes)
- **점수**: 일정당 여러 게임 기록이 가능하며, 대시보드에서는 평균값을 차트로 보여줍니다.
- **출석**: 일정 시작 전까지 회원이 직접 변경 가능하며, 이후에는 관리자가 조정합니다.
- **회원 ID**: 이메일은 고유값이며 가입 후 변경이 불가능합니다.
- **대회**: 현재 UI 목업(`TournamentMockPage`)만 구현되어 있으며 로직은 추후 확장 예정입니다.
