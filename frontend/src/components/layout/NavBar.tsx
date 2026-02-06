import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/auth/useAuth';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A]/98 backdrop-blur-sm z-50 flex items-center justify-between px-6 border-b border-[#262626]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#EDEDED] rounded-sm flex items-center justify-center text-[#0A0A0A] font-bold text-lg">
          D
        </div>
        <Link to="/" className="font-sans text-lg font-bold tracking-tight text-[#EDEDED]">
          DEGURURU
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[#EDEDED]">{user?.name}</span>
            <span className="text-[10px] text-[#A3A3A3] font-medium tracking-wider uppercase">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="text-xs font-medium text-[#A3A3A3] hover:text-[#EDEDED] transition-colors border border-[#262626] px-3 py-1.5 rounded-md hover:bg-[#171717]"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
