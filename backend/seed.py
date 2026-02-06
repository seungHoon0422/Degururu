"""
Seed script to populate the database with initial data.

Usage:
    python3 -m seed

This script will:
- Clear existing data (optional based on CLEAR_DATA env var)
- Create 1 Admin user
- Create 3 Member users
- Create 5 Schedules (Saturday 10:00 AM slots)
- Create sample Attendance records
- Create sample Score records
- Create sample Announcements
"""
from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.session import async_session_factory
from app.models import Announcement, Attendance, AttendanceStatus, Schedule, Score, User, UserRole, MemberType


async def clear_all_data(session: AsyncSession) -> None:
    """Clear all data from all tables."""
    print("🗑️  Clearing existing data...")
    
    # Delete in correct order to respect foreign keys
    await session.execute(Announcement.__table__.delete())
    await session.execute(Score.__table__.delete())
    await session.execute(Attendance.__table__.delete())
    await session.execute(Schedule.__table__.delete())
    await session.execute(User.__table__.delete())
    
    await session.commit()
    print("✅ All data cleared")


async def create_users(session: AsyncSession) -> dict[str, User]:
    """Create admin and member users."""
    print("\n👤 Creating users...")
    
    users = {}
    
    # Create admin user
    admin = User(
        id=uuid.uuid4(),
        email="admin@degururu.com",
        password_hash=get_password_hash("admin1234"),
        name="Admin User",
        role=UserRole.ADMIN,
        member_type=None,
        description="System administrator",
        is_active=True,
    )
    session.add(admin)
    users["admin"] = admin
    print(f"  ✓ Created admin: {admin.email}")
    
    # Create member users
    member_data = [
        {
            "email": "member1@gmail.com",
            "name": "Kim Jimin",
            "member_type": MemberType.FULL,
            "description": "Regular member since 2023",
        },
        {
            "email": "member2@gmail.com",
            "name": "Lee Sooyoung",
            "member_type": MemberType.FULL,
            "description": "Enthusiastic bowler",
        },
        {
            "email": "member3@gmail.com",
            "name": "Park Minsu",
            "member_type": MemberType.ASSOCIATE,
            "description": "New associate member",
        },
    ]
    
    for idx, data in enumerate(member_data, 1):
        member = User(
            id=uuid.uuid4(),
            email=data["email"],
            password_hash=get_password_hash("member1234"),
            name=data["name"],
            role=UserRole.MEMBER,
            member_type=data["member_type"],
            description=data["description"],
            is_active=True,
        )
        session.add(member)
        users[f"member{idx}"] = member
        print(f"  ✓ Created member: {member.email} ({member.name})")
    
    await session.commit()
    print(f"✅ Created {len(users)} users")
    
    return users


async def create_schedules(session: AsyncSession, admin: User) -> list[Schedule]:
    """Create 5 Saturday 10:00 AM schedules."""
    print("\n📅 Creating schedules...")
    
    schedules = []
    
    # Start from next Saturday
    now = datetime.now(timezone.utc)
    days_until_saturday = (5 - now.weekday()) % 7
    if days_until_saturday == 0:
        days_until_saturday = 7  # Next Saturday if today is Saturday
    
    next_saturday = now + timedelta(days=days_until_saturday)
    base_date = next_saturday.replace(hour=10, minute=0, second=0, microsecond=0)
    
    locations = [
        "Strike Bowling Center",
        "Downtown Lanes",
        "Strike Bowling Center",
        "Premium Bowl",
        "Strike Bowling Center",
    ]
    
    for i in range(5):
        schedule_date = base_date + timedelta(weeks=i)
        schedule = Schedule(
            id=uuid.uuid4(),
            title=f"Weekly Bowling Session - Week {i+1}",
            starts_at=schedule_date,
            location=locations[i],
            notes=f"Regular Saturday morning session. Week {i+1} of 5." if i < 4 else "Final session of the month!",
            created_by=admin.id,
            is_cancelled=False,
        )
        session.add(schedule)
        schedules.append(schedule)
        print(f"  ✓ Created schedule: {schedule.title} at {schedule.starts_at.strftime('%Y-%m-%d %H:%M')}")
    
    await session.commit()
    print(f"✅ Created {len(schedules)} schedules")
    
    return schedules


async def create_attendance(session: AsyncSession, schedules: list[Schedule], members: list[User]) -> None:
    """Create sample attendance records."""
    print("\n✓ Creating attendance records...")
    
    attendance_count = 0
    
    # Create attendance for first 3 schedules
    for schedule_idx, schedule in enumerate(schedules[:3]):
        for member_idx, member in enumerate(members):
            # Vary attendance status based on pattern
            if schedule_idx == 0:  # First schedule - everyone attends
                status = AttendanceStatus.ATTEND
                comment = None
            elif schedule_idx == 1:  # Second schedule - one absent
                if member_idx == 2:
                    status = AttendanceStatus.ABSENT
                    comment = "Family event"
                else:
                    status = AttendanceStatus.ATTEND
                    comment = None
            else:  # Third schedule - mixed
                if member_idx == 0:
                    status = AttendanceStatus.ATTEND
                    comment = "Looking forward to it!"
                elif member_idx == 1:
                    status = AttendanceStatus.UNKNOWN
                    comment = "Will confirm later"
                else:
                    status = AttendanceStatus.ATTEND
                    comment = None
            
            attendance = Attendance(
                id=uuid.uuid4(),
                schedule_id=schedule.id,
                user_id=member.id,
                status=status,
                comment=comment,
            )
            session.add(attendance)
            attendance_count += 1
    
    await session.commit()
    print(f"✅ Created {attendance_count} attendance records")


async def create_scores(session: AsyncSession, schedules: list[Schedule], members: list[User]) -> None:
    """Create sample score records."""
    print("\n🎯 Creating score records...")
    
    score_count = 0
    
    # Create scores for first 2 schedules (completed sessions)
    base_scores = [
        [120, 135, 148],  # member1 scores
        [145, 138, 152],  # member2 scores
        [110, 125, 118],  # member3 scores (only for first schedule as they were absent on second)
    ]
    
    for schedule_idx in range(2):
        schedule = schedules[schedule_idx]
        
        for member_idx, member in enumerate(members):
            # Skip member3 scores for second schedule (they were absent)
            if schedule_idx == 1 and member_idx == 2:
                continue
            
            # Create 3 games per member per schedule
            for game_no in range(1, 4):
                score_value = base_scores[member_idx][game_no - 1]
                # Add some variation
                score_value += (schedule_idx * 5) + (game_no * 2)
                
                score = Score(
                    id=uuid.uuid4(),
                    schedule_id=schedule.id,
                    user_id=member.id,
                    game_no=game_no,
                    score=score_value,
                )
                session.add(score)
                score_count += 1
    
    await session.commit()
    print(f"✅ Created {score_count} score records")


async def create_announcements(session: AsyncSession, admin: User, members: list[User]) -> None:
    """Create sample announcements."""
    print("\n📢 Creating announcements...")
    
    announcements_data = [
        {
            "title": "Welcome to Degururu Bowling Club!",
            "content": "Welcome to our bowling club management system. Here you can track schedules, scores, and stay updated with club news.",
            "author": admin,
            "is_pinned": True,
        },
        {
            "title": "New Scoring System",
            "content": "We've implemented a new digital scoring system. All scores will now be tracked automatically in the system.",
            "author": admin,
            "is_pinned": True,
        },
        {
            "title": "Monthly Tournament Announcement",
            "content": "Our monthly tournament is coming up next month! Registration will open soon. Prize pool of $500!",
            "author": admin,
            "is_pinned": False,
        },
        {
            "title": "Practice Tips Shared",
            "content": "Hey everyone! I found some great tips for improving your hook. Check out the video I shared in the group chat.",
            "author": members[0],
            "is_pinned": False,
        },
        {
            "title": "Equipment Sale",
            "content": "Looking to sell my old bowling ball and shoes. Great condition! DM me if interested.",
            "author": members[1],
            "is_pinned": False,
        },
    ]
    
    for data in announcements_data:
        announcement = Announcement(
            id=uuid.uuid4(),
            title=data["title"],
            content=data["content"],
            author_id=data["author"].id,
            is_pinned=data["is_pinned"],
            is_deleted=False,
        )
        session.add(announcement)
        print(f"  ✓ Created announcement: {announcement.title}")
    
    await session.commit()
    print(f"✅ Created {len(announcements_data)} announcements")


async def seed_database() -> None:
    """Main seed function."""
    print("=" * 60)
    print("🌱 Starting database seeding...")
    print("=" * 60)
    
    async with async_session_factory() as session:
        # Clear existing data if requested
        should_clear = os.getenv("CLEAR_DATA", "true").lower() in ("true", "1", "yes")
        if should_clear:
            await clear_all_data(session)
        
        # Create all data
        users = await create_users(session)
        admin = users["admin"]
        members = [users["member1"], users["member2"], users["member3"]]
        
        schedules = await create_schedules(session, admin)
        await create_attendance(session, schedules, members)
        await create_scores(session, schedules, members)
        await create_announcements(session, admin, members)
    
    print("\n" + "=" * 60)
    print("✅ Database seeding completed successfully!")
    print("=" * 60)
    print("\n📋 Summary:")
    print(f"  • 1 Admin user (admin@degururu.com / admin1234)")
    print(f"  • 3 Member users (member1-3@gmail.com / member1234)")
    print(f"  • 5 Saturday schedules")
    print(f"  • Attendance records for first 3 schedules")
    print(f"  • Score records for first 2 schedules")
    print(f"  • 5 Announcements")
    print()


def main() -> None:
    """Entry point for seed script."""
    try:
        asyncio.run(seed_database())
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise


if __name__ == "__main__":
    main()
