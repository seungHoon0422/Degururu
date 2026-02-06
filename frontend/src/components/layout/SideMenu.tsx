import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../app/auth/useAuth';

interface MenuItem {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: '대시보드', path: '/' },
  { label: '일정 확인', path: '/schedules' },
  { label: '내 출석부', path: '/attendance' },
  { label: '점수 통계', path: '/scores/trend' },
  { label: '공지사항', path: '/announcements' },
  { label: '대회안내', path: '/tournament' },
  { label: '회원 관리', path: '/admin/members', adminOnly: true },
  { label: '일정 관리', path: '/admin/schedules', adminOnly: true },
  { label: '공지 관리', path: '/admin/announcements', adminOnly: true },
];

const SideMenu: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#0A0A0A] border-r border-[#262626] p-6 hidden lg:block overflow-y-auto">
      <div className="space-y-1">
        {menuItems.map((item) => {
          if (item.adminOnly && user?.role !== 'ADMIN') return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 font-sans ${
                  isActive
                    ? 'bg-[#171717] text-[#EDEDED] ring-1 ring-[#262626]'
                    : 'text-[#A3A3A3] hover:text-[#EDEDED] hover:bg-[#171717]'
                }`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-12 p-4 rounded-lg border border-[#262626] bg-[#0A0A0A] text-[#EDEDED]">
        <p className="text-[10px] font-bold text-[#A3A3A3] uppercase tracking-[0.2em] mb-2">Bowling Club</p>
        <p className="text-xs font-medium leading-relaxed text-[#A3A3A3]">
          데구르르 볼링클럽에 오신 것을 환영합니다.
        </p>
      </div>
    </aside>
  );
};

export default SideMenu;
