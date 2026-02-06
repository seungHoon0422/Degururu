import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { schedulesApi } from '../api/schedules';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const SchedulesPage: React.FC = () => {
  const { data: schedules, isLoading } = useQuery({ 
    queryKey: ['schedules'], 
    queryFn: schedulesApi.getSchedules 
  });

  const sortedSchedules = schedules?.sort((a, b) => 
    new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime()
  );

  const getStatusInfo = (schedule: any) => {
    if (schedule.is_cancelled) return { label: 'CANCELLED', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
    const now = new Date();
    const start = new Date(schedule.starts_at);
    if (start > now) return { label: 'UPCOMING', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
    return { label: 'COMPLETED', color: 'bg-neutral-800 text-neutral-400 border-neutral-700' };
  };

  if (isLoading) return <div className="text-[#A3A3A3] animate-pulse font-mono text-2xl tracking-tighter">LOADING_SCHEDULES...</div>;

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white">SESSIONS</h1>
          <p className="text-[#A3A3A3] font-medium">Track upcoming and past bowling events.</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#A3A3A3] font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> UPCOMING
          </div>
          <div className="flex items-center gap-2 text-[12px] font-bold text-[#A3A3A3] font-mono">
            <span className="w-2 h-2 rounded-full bg-neutral-700" /> COMPLETED
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedSchedules?.map((schedule) => {
          const status = getStatusInfo(schedule);
          return (
            <Link 
              key={schedule.id} 
              to={`/schedules/${schedule.id}`}
              className="group bg-[#171717] border border-[#262626] hover:border-[#404040] p-8 rounded-2xl transition-all duration-300 hover:translate-y-[-4px] flex flex-col justify-between min-h-[240px] shadow-sm hover:shadow-xl"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${status.color}`}>
                    {status.label}
                  </span>
                  <span className="text-[#525252] text-[12px] font-mono font-bold tracking-tighter">
                     #{schedule.id.slice(0, 4).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#3B82F6] transition-colors mb-3 tracking-tight">
                  {schedule.title}
                </h3>
                <p className="text-[#A3A3A3] text-[13px] font-mono font-medium flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {schedule.starts_at ? format(new Date(schedule.starts_at), 'MMM d, yyyy • HH:mm') : 'N/A'}
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t border-[#262626] flex justify-between items-center">
                <span className="text-[#A3A3A3] text-[13px] font-bold flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {schedule.location}
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#262626] border border-[#404040] flex items-center justify-center group-hover:bg-[#3B82F6] group-hover:border-[#3B82F6] transition-all duration-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SchedulesPage;
