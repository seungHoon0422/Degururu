import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard, AdminGuard, PublicOnlyGuard } from './auth/guards';
import AppLayout from '../components/layout/AppLayout';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import SchedulesPage from '../pages/SchedulesPage';
import ScheduleDetailPage from '../pages/ScheduleDetailPage';
import AttendancePage from '../pages/AttendancePage';
import ScoreTrendPage from '../pages/ScoreTrendPage';
import AnnouncementsPage from '../pages/AnnouncementsPage';
import AnnouncementDetailPage from '../pages/AnnouncementDetailPage';
import TournamentMockPage from '../pages/TournamentMockPage';

import MembersPage from '../pages/admin/MembersPage';
import MemberDetailPage from '../pages/admin/MemberDetailPage';
import SchedulesAdminPage from '../pages/admin/SchedulesAdminPage';
import AttendanceAdminPage from '../pages/admin/AttendanceAdminPage';
import AnnouncementsAdminPage from '../pages/admin/AnnouncementsAdminPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicOnlyGuard>
        <LoginPage />
      </PublicOnlyGuard>
    ),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'schedules', element: <SchedulesPage /> },
      { path: 'schedules/:id', element: <ScheduleDetailPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'scores/trend', element: <ScoreTrendPage /> },
      { path: 'announcements', element: <AnnouncementsPage /> },
      { path: 'announcements/:id', element: <AnnouncementDetailPage /> },
      { path: 'tournament', element: <TournamentMockPage /> },
      
      // Admin Routes
      {
        path: 'admin',
        element: <AdminGuard><Navigate to="/admin/members" replace /></AdminGuard>,
      },
      {
        path: 'admin/members',
        element: <AdminGuard><MembersPage /></AdminGuard>,
      },
      {
        path: 'admin/members/:id',
        element: <AdminGuard><MemberDetailPage /></AdminGuard>,
      },
      {
        path: 'admin/schedules',
        element: <AdminGuard><SchedulesAdminPage /></AdminGuard>,
      },
      {
        path: 'admin/schedules/:id/attendance',
        element: <AdminGuard><AttendanceAdminPage /></AdminGuard>,
      },
      {
        path: 'admin/announcements',
        element: <AdminGuard><AnnouncementsAdminPage /></AdminGuard>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
