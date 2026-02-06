import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import SideMenu from './SideMenu';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#EDEDED] selection:text-[#0A0A0A]">
      <NavBar />
      <SideMenu />
      
      <main className="lg:pl-64 pt-16 min-h-screen transition-all duration-300">
        <div className="p-8 md:p-12 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>

      <footer className="lg:pl-64 py-12 text-center text-[#525252] text-[10px] tracking-widest uppercase border-t border-[#171717]">
        &copy; {new Date().getFullYear()} Degururu Bowling Club. All rights reserved.
      </footer>
    </div>
  );
};

export default AppLayout;
