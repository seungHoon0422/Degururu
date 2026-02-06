# 데구르르 볼링 동아리 관리 사이트 - 설계 문서

## 1. 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 데구르르 (Degururu) |
| 목적 | 볼링 동아리 일정·출석·점수·공지 관리 |
| 예상 사용자 규모 | 20~50명 |
| 기술 스택 | React (Vite + TS) + FastAPI + PostgreSQL |

---

## 2. 기술 스택 상세

| 계층 | 기술 | 비고 |
|------|------|------|
| Frontend | React 18+ / Vite / TypeScript | SPA |
| 상태관리 | TanStack Query (서버) + Context (인증) | |
| 차트 | Recharts | 점수 그래프용 |
| UI 프레임워크 | 추후 결정 (MUI / Ant Design / Tailwind 등) | |
| Backend | Python 3.11+ / FastAPI | async |
| ORM | SQLAlchemy 2.0 (async) | |
| 마이그레이션 | Alembic | |
| DB | PostgreSQL 15+ | |
| 인증 | JWT (access token) | bcrypt 해싱 |

---

## 3. ERD (Entity Relationship Diagram)

### 3.1 users (회원)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 ID |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt 해시 |
| name | VARCHAR(100) | NOT NULL | 표시 이름 |
| role | VARCHAR(20) | NOT NULL | `ADMIN`, `MEMBER` |
| member_type | VARCHAR(20) | NULLABLE | `FULL`(정회원), `ASSOCIATE`(준회원). Admin은 null |
| description | TEXT | NULLABLE | 프로필 소개 |
| is_active | BOOLEAN | DEFAULT true | 활성 상태 |
| last_login_at | TIMESTAMPTZ | NULLABLE | |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

### 3.2 schedules (일정)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| title | VARCHAR(200) | NOT NULL | 일정명 (예: "정기전") |
| starts_at | TIMESTAMPTZ | NOT NULL | 일정 시작 시간 |
| location | VARCHAR(200) | NULLABLE | 장소 |
| notes | TEXT | NULLABLE | 메모 |
| created_by | UUID | FK → users.id | 등록한 관리자 |
| is_cancelled | BOOLEAN | DEFAULT false | 취소 여부 |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

### 3.3 attendance (출석)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| schedule_id | UUID | FK → schedules.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| status | VARCHAR(20) | NOT NULL | `UNKNOWN`, `ATTEND`, `ABSENT` |
| comment | VARCHAR(300) | NULLABLE | 사유/메모 |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

**제약**: `UNIQUE(schedule_id, user_id)` — 일정당 회원별 1건

### 3.4 scores (점수)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| schedule_id | UUID | FK → schedules.id, NOT NULL | |
| user_id | UUID | FK → users.id, NOT NULL | |
| game_no | SMALLINT | DEFAULT 1 | 게임 번호 (1, 2, 3...) |
| score | SMALLINT | NOT NULL | 0~300 |
| created_at | TIMESTAMPTZ | DEFAULT now() | |

**제약**: `UNIQUE(schedule_id, user_id, game_no)` — 다중 게임 지원

### 3.5 announcements (공지사항)

| 필드 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | PK | |
| title | VARCHAR(200) | NOT NULL | |
| content | TEXT | NOT NULL | |
| author_id | UUID | FK → users.id, NOT NULL | |
| is_pinned | BOOLEAN | DEFAULT false | 상단 고정 |
| is_deleted | BOOLEAN | DEFAULT false | 소프트 삭제 |
| created_at | TIMESTAMPTZ | DEFAULT now() | |
| updated_at | TIMESTAMPTZ | DEFAULT now() | |

### 3.6 관계 요약

```
users (1) ──< attendance >── (1) schedules
users (1) ──< scores     >── (1) schedules
users (1) ──< announcements
users (1) ──< schedules (created_by)
```

---

## 4. API 설계

> Base URL: `/api`  
> 인증: `Authorization: Bearer <JWT>`  
> 권한: Public(미인증) / Member(로그인) / Admin(관리자)

### 4.1 인증 (Auth)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| POST | `/api/auth/login` | 로그인 → access token 반환 | Public |
| GET | `/api/auth/me` | 현재 사용자 정보 | Member |
| POST | `/api/auth/change-password` | 비밀번호 변경 | Member |

### 4.2 회원 관리 (Users)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/users` | 회원 목록 (필터/페이징) | Admin |
| POST | `/api/users` | 회원 생성 | Admin |
| GET | `/api/users/{user_id}` | 회원 상세 | Admin |
| PATCH | `/api/users/{user_id}` | 회원 수정 (역할/상태 등) | Admin |
| DELETE | `/api/users/{user_id}` | 회원 비활성화 | Admin |
| GET | `/api/profile` | 내 프로필 조회 | Member |
| PATCH | `/api/profile` | 내 프로필 수정 (description) | Member |

### 4.3 일정 관리 (Schedules)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/schedules` | 일정 목록 (날짜 범위/페이징) | Member |
| POST | `/api/schedules` | 일정 생성 | Admin |
| GET | `/api/schedules/{schedule_id}` | 일정 상세 | Member |
| PATCH | `/api/schedules/{schedule_id}` | 일정 수정 | Admin |
| DELETE | `/api/schedules/{schedule_id}` | 일정 취소 (soft) | Admin |

### 4.4 출석 관리 (Attendance)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/schedules/{id}/attendance` | 일정별 출석 현황 | Member |
| PUT | `/api/schedules/{id}/attendance/{user_id}` | 출석 상태 설정 | Admin |
| GET | `/api/attendance/me` | 내 출석 이력 | Member |
| PUT | `/api/schedules/{id}/attendance/me` | 내 출석 체크 | Member |

> **검토 필요**: 일반 회원이 본인의 출석을 직접 체크할 수 있는지, 관리자만 관리하는지 확인 필요

### 4.5 점수 관리 (Scores)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/schedules/{id}/scores` | 일정별 점수 목록 | Member |
| POST | `/api/schedules/{id}/scores` | 내 점수 기록 (score, game_no) | Member |
| PATCH | `/api/scores/{score_id}` | 점수 수정 | Owner/Admin |
| DELETE | `/api/scores/{score_id}` | 점수 삭제 | Owner/Admin |
| GET | `/api/scores/me/trend` | 내 점수 추이 (시계열) | Member |
| GET | `/api/schedules/{id}/stats` | 일정별 통계 (평균/최고/최저) | Member |

### 4.6 공지사항 (Announcements)

| Method | Path | 설명 | 권한 |
|--------|------|------|------|
| GET | `/api/announcements` | 공지 목록 (고정 우선/페이징) | Member |
| POST | `/api/announcements` | 공지 작성 | Admin |
| GET | `/api/announcements/{id}` | 공지 상세 | Member |
| PATCH | `/api/announcements/{id}` | 공지 수정 | Admin |
| DELETE | `/api/announcements/{id}` | 공지 삭제 (soft) | Admin |

---

## 5. 프론트엔드 페이지 구조

### 5.1 라우팅

| 경로 | 페이지 | 권한 |
|------|--------|------|
| `/login` | 로그인 | Public |
| `/` | 대시보드 (다음 일정, 공지 미리보기) | Member |
| `/profile` | 내 프로필 수정 | Member |
| `/schedules` | 일정 목록 | Member |
| `/schedules/:id` | 일정 상세 (출석+점수 차트) | Member |
| `/attendance` | 내 출석 이력 | Member |
| `/scores/trend` | 내 점수 추이 그래프 | Member |
| `/announcements` | 공지 목록 | Member |
| `/announcements/:id` | 공지 상세 | Member |
| `/tournament` | 대회 (UI 목업) | Member |
| `/admin/members` | 회원 관리 | Admin |
| `/admin/members/:id` | 회원 상세/수정 | Admin |
| `/admin/schedules` | 일정 관리 | Admin |
| `/admin/schedules/:id/attendance` | 출석 관리 매트릭스 | Admin |
| `/admin/announcements` | 공지 관리 | Admin |

### 5.2 주요 컴포넌트

| 영역 | 컴포넌트 | 역할 |
|------|----------|------|
| 레이아웃 | `AppLayout`, `NavBar`, `SideMenu` | 공통 레이아웃 |
| 인증 | `AuthGuard`, `AdminGuard`, `AuthProvider` | 라우트 보호 |
| 대시보드 | `NextScheduleCard`, `AnnouncementsPreview` | 요약 정보 |
| 일정 | `ScheduleList`, `ScheduleCard`, `ScheduleDetail` | 일정 표시 |
| 점수 | `ScoreInputModal`, `ScheduleScoresChart`, `TrendChart` | 점수 입력/차트 |
| 출석 | `AttendanceTable`, `AttendanceBadge` | 출석 상태 |
| 공지 | `AnnouncementList`, `AnnouncementDetail`, `AnnouncementEditor` | 공지 CRUD |
| 관리 | `MemberTable`, `MemberForm`, `AttendanceMatrix` | 관리자 기능 |
| 공통 | `DataTable`, `Pagination`, `ConfirmDialog`, `Loading`, `ErrorState` | 재사용 UI |

### 5.3 상태 관리

| 구분 | 도구 | 용도 |
|------|------|------|
| 서버 상태 | TanStack Query | API 데이터 캐싱/동기화 |
| 인증 상태 | React Context | JWT 토큰, 사용자 정보 |
| UI 상태 | 컴포넌트 로컬 state | 모달, 필터 등 |

---

## 6. 디렉토리 구조

### 6.1 Backend

```
backend/
  app/
    main.py                         # FastAPI 앱 진입점
    core/
      config.py                     # 환경 설정 (pydantic-settings)
      security.py                   # JWT, 비밀번호 해싱
      deps.py                       # 공통 의존성 (DB 세션, 현재 사용자)
    db/
      base.py                       # SQLAlchemy declarative_base
      session.py                    # async engine + sessionmaker
    models/
      user.py
      schedule.py
      attendance.py
      score.py
      announcement.py
    schemas/
      auth.py
      user.py
      schedule.py
      attendance.py
      score.py
      announcement.py
      common.py                     # 페이징, 에러 응답
    services/
      auth_service.py
      user_service.py
      schedule_service.py
      attendance_service.py
      score_service.py
      announcement_service.py
    api/
      routers/
        auth.py
        users.py
        schedules.py
        attendance.py
        scores.py
        announcements.py
    tests/
  pyproject.toml
  alembic.ini
```

### 6.2 Frontend

```
frontend/
  src/
    app/
      router.tsx                    # 라우트 정의 + 가드
      queryClient.ts                # React Query 설정
      auth/
        AuthProvider.tsx
        useAuth.ts
    api/
      client.ts                     # API 클라이언트 (토큰 첨부, 401 처리)
      auth.ts
      users.ts
      schedules.ts
      attendance.ts
      scores.ts
      announcements.ts
    pages/
      LoginPage.tsx
      DashboardPage.tsx
      ProfilePage.tsx
      SchedulesPage.tsx
      ScheduleDetailPage.tsx
      AttendancePage.tsx
      ScoreTrendPage.tsx
      AnnouncementsPage.tsx
      AnnouncementDetailPage.tsx
      TournamentMockPage.tsx
      admin/
        MembersPage.tsx
        MemberDetailPage.tsx
        SchedulesAdminPage.tsx
        AttendanceAdminPage.tsx
        AnnouncementsAdminPage.tsx
    components/
      layout/
        AppLayout.tsx
        NavBar.tsx
        SideMenu.tsx
      common/
        DataTable.tsx
        Pagination.tsx
        ConfirmDialog.tsx
        Loading.tsx
        ErrorState.tsx
      charts/
        ScheduleScoresChart.tsx
        TrendChart.tsx
    styles/
      index.css
    main.tsx
  vite.config.ts
  tsconfig.json
```

---

## 7. 보안 고려사항

| 항목 | 방안 |
|------|------|
| 비밀번호 저장 | bcrypt 해싱 (plaintext 금지) |
| 인증 토큰 | JWT access token (30~60분 만료) |
| 권한 체크 | 라우터 레벨 RBAC (Admin/Member) + 소유자 확인 |
| IDOR 방지 | 프로필 수정 시 본인 확인, 점수 수정 시 소유자/관리자 확인 |
| CORS | 프론트엔드 도메인만 허용 |
| SQL Injection | SQLAlchemy 파라미터 바인딩 (raw query 금지) |
| 입력 검증 | Pydantic schema로 모든 입력값 검증 |

---

## 8. 검증 규칙 (Validation)

| 필드 | 규칙 |
|------|------|
| email | RFC 형식, 소문자 변환, unique |
| password | 최소 8자 |
| score | 정수 0~300 |
| member_type | role=MEMBER일 때 필수 (`FULL` / `ASSOCIATE`) |
| attendance status | enum: `UNKNOWN`, `ATTEND`, `ABSENT` |
| game_no | 양의 정수 (1 이상) |

---

## 9. 요구사항 Gap 분석 & 제안

### 9.1 모호한 부분 (검토 필요)

| 항목 | 현재 요구사항 | 질문 |
|------|--------------|------|
| 출석 체크 주체 | "일반 회원은 출석 여부 체크만 가능" | 본인이 직접 체크? 관리자가 체크? 혹은 둘 다? |
| 점수 게임 수 | "단순 스코어 입력" | 일정당 1게임? 여러 게임 기록 가능? |
| 프로필 "id" 수정 | "프로필은 id, password, description" | id = email? email 변경 허용 여부 |
| 공지사항 작성 권한 | 명시되지 않음 | 관리자만? 모든 회원? |

### 9.2 추가 제안 기능

| 기능 | 설명 | 우선순위 |
|------|------|----------|
| 대시보드 | 다음 일정, 내 출석 상태, 최근 공지 요약 | 높음 |
| 페이지네이션 | 목록 API 전체 적용 | 높음 |
| 일정 필터 | 예정/지난 일정 구분 | 중간 |
| 소프트 삭제 | 회원, 공지 비활성화 방식 | 중간 |
| 회원 검색 | 이름/이메일 검색 | 낮음 |
| 일정별 통계 | 평균/최고/최저 점수 | 중간 |

### 9.3 대회 관리 (미래)

현재는 **UI 목업만** 제작. 백엔드 로직 없음.
추후 구현 시 필요 테이블: `tournaments`, `tournament_participants`, `matches` 등.

---

## 10. 구현 순서 (권장)

| 순서 | 영역 | 설명 |
|------|------|------|
| 1 | 프로젝트 세팅 | Backend/Frontend 초기 구조, DB 연결, Alembic 설정 |
| 2 | 인증 | 로그인, JWT, AuthGuard |
| 3 | 회원 관리 | Admin CRUD + 프로필 수정 |
| 4 | 일정 관리 | CRUD + 목록/상세 |
| 5 | 출석 관리 | 출석 체크 + 관리자 매트릭스 |
| 6 | 점수 관리 | 점수 기록 + 차트 |
| 7 | 공지사항 | CRUD + 목록 |
| 8 | 대시보드 | 요약 페이지 |
| 9 | 대회 (UI) | 목업 페이지 |
