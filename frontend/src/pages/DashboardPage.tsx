import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schedulesApi } from '../api/schedules';
import { announcementsApi } from '../api/announcements';
import { usersApi } from '../api/users';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, TrendingUp, Trophy, Megaphone, ArrowRight, User } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: usersApi.getMe });
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: schedulesApi.getSchedules });
  const { data: announcements } = useQuery({ queryKey: ['announcements'], queryFn: announcementsApi.getAnnouncements });

  const nextSchedule = schedules?.[0];
  const latestNotice = announcements?.[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out font-sans selection:bg-white selection:text-black">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px w-8 bg-blue-500" />
            <span className="text-[#A3A3A3] text-xs font-bold tracking-[0.3em] uppercase">Overview</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-[#EDEDED]">
            WELCOME BACK, <span className="text-blue-500">{user?.name?.toUpperCase() || 'MEMBER'}</span>
          </h1>
          <p className="text-[#A3A3A3] mt-2 font-normal text-lg">Here's the latest from Degururu.</p>
        </div>
        <div className="text-[#A3A3A3] text-xs font-mono bg-[#171717] px-5 py-3 rounded-full border border-[#262626] shadow-sm flex items-center gap-3">
          <Calendar size={14} className="text-blue-500" />
          {format(new Date(), 'EEEE, MMMM do').toUpperCase()}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 auto-rows-[160px] gap-4 lg:gap-6">
        
        <div className="md:col-span-6 lg:col-span-8 row-span-3 bg-[#171717] border border-[#262626] rounded-[2rem] p-8 lg:p-12 relative overflow-hidden group hover:border-[#333333] hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.1)] transition-all duration-500">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 pointer-events-none">
            <Calendar size={240} strokeWidth={0.5} />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest mb-8 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Up Next
              </div>
              
              {nextSchedule ? (
                <div className="max-w-xl">
                  <h2 className="text-4xl lg:text-6xl font-black text-[#EDEDED] mb-6 leading-[1.1] tracking-tighter">
                    {nextSchedule.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-6 text-[#A3A3A3]">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-[#262626] rounded-lg">
                        <User size={18} className="text-blue-500" />
                      </div>
                      <span className="font-medium text-[#EDEDED]">{nextSchedule.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 font-mono">
                      <div className="p-2 bg-[#262626] rounded-lg">
                        <TrendingUp size={18} className="text-blue-500" />
                      </div>
                      <span className="text-blue-400">
                        {nextSchedule.starts_at ? format(new Date(nextSchedule.starts_at), 'MMM d @ HH:mm') : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[#A3A3A3] text-xl font-medium italic">No upcoming sessions scheduled yet.</p>
              )}
            </div>

            {nextSchedule && (
              <div className="mt-12">
                <Link 
                  to={`/schedules/${nextSchedule.id}`}
                  className="group/btn inline-flex items-center gap-4 bg-[#EDEDED] text-black font-black px-8 py-4 rounded-2xl hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl"
                >
                  JOIN SESSION
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3 lg:col-span-4 row-span-2 bg-[#171717] border border-[#262626] rounded-[2rem] p-8 relative overflow-hidden group hover:border-[#333333] transition-all duration-500">
          <div className="h-full flex flex-col justify-between relative z-10">
            <div>
              <div className="p-3 bg-[#262626] w-fit rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp size={20} className="text-blue-500" />
              </div>
              <h3 className="text-[#A3A3A3] text-xs font-bold uppercase tracking-[0.2em]">Attendance</h3>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black text-[#EDEDED] font-mono tracking-tighter">92%</span>
                <span className="text-green-500 text-sm font-bold font-mono">+4%</span>
              </div>
              <p className="text-[#A3A3A3] text-xs font-medium">Higher than club average</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>

        <div className="md:col-span-3 lg:col-span-4 row-span-2 bg-[#171717] border border-[#262626] rounded-[2rem] p-8 relative overflow-hidden group hover:border-[#333333] transition-all duration-500">
          <div className="h-full flex flex-col justify-between relative z-10">
            <div>
              <div className="p-3 bg-[#262626] w-fit rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <Trophy size={20} className="text-blue-500" />
              </div>
              <h3 className="text-[#A3A3A3] text-xs font-bold uppercase tracking-[0.2em]">Avg Score</h3>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-black text-[#EDEDED] font-mono tracking-tighter">184</span>
              </div>
              <p className="text-[#A3A3A3] text-xs font-medium">Last 10 sessions</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </div>

        <div className="md:col-span-6 lg:col-span-8 row-span-2 bg-[#171717] border border-[#262626] rounded-[2rem] p-8 lg:p-10 flex flex-col group hover:border-[#333333] transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#262626] rounded-lg">
                <Megaphone size={16} className="text-blue-500" />
              </div>
              <h3 className="text-[#A3A3A3] text-xs font-bold uppercase tracking-[0.2em]">Latest Announcement</h3>
            </div>
            <Link to="/announcements" className="text-[#A3A3A3] text-[10px] font-black tracking-widest hover:text-white transition-colors border-b border-[#262626] pb-1">
              VIEW ALL
            </Link>
          </div>
          
          {latestNotice ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-2xl font-bold text-[#EDEDED] mb-3 line-clamp-1 leading-tight tracking-tight group-hover:text-blue-400 transition-colors">
                  {latestNotice.title}
                </h4>
                <p className="text-[#A3A3A3] line-clamp-2 text-base leading-relaxed max-w-2xl">
                  {latestNotice.content}
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-[#262626] flex items-center justify-between">
                <div className="text-[#737373] text-[10px] font-mono font-bold uppercase tracking-wider">
                  PUBLISHED: {latestNotice.created_at ? format(new Date(latestNotice.created_at), 'MMM dd, yyyy') : 'N/A'}
                </div>
                <Link to="/announcements" className="text-blue-500 p-2 hover:bg-blue-500/5 rounded-full transition-all">
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-[#A3A3A3] italic font-medium">No announcements yet.</p>
          )}
        </div>

        <Link to="/scores/trend" className="md:col-span-6 lg:col-span-4 row-span-1 bg-[#262626]/30 border border-[#262626] rounded-[2rem] p-6 flex items-center justify-between group hover:bg-[#262626]/50 hover:border-[#333333] transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#171717] rounded-2xl group-hover:rotate-12 transition-transform duration-500">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[#EDEDED] font-bold text-sm">Full Analytics</p>
              <p className="text-[#A3A3A3] text-[10px] uppercase font-bold tracking-widest">Score Trends</p>
            </div>
          </div>
          <ArrowRight size={18} className="text-[#737373] group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>

      </div>
    </div>
  );
};

export default DashboardPage;

