import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '../../api/schedules';
import { usersApi } from '../../api/users';

const AttendanceAdminPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: schedule } = useQuery({
    queryKey: ['admin', 'schedules', id],
    queryFn: () => schedulesApi.getSchedule(id!)
  });

  const { data: users } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.getUsers
  });

  const { data: attendance } = useQuery({
    queryKey: ['admin', 'schedules', id, 'attendance'],
    queryFn: () => schedulesApi.getScheduleAttendance(id!)
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string, status: string }) => 
      schedulesApi.updateAttendanceByAdmin(id!, userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules', id, 'attendance'] });
    }
  });

  const getStatus = (userId: string) => {
    return attendance?.find(a => a.user_id === userId)?.status || 'UNKNOWN';
  };

  const statusColors: Record<string, string> = {
    ATTEND: 'bg-green-500 text-white',
    ABSENT: 'bg-red-500 text-white',
    UNKNOWN: 'bg-zinc-800 text-zinc-500'
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic leading-none">
            Attendance <span className="text-blue-500">Matrix</span>
          </h1>
          <p className="text-[#A3A3A3] font-medium mt-1">{schedule?.title}</p>
        </div>
      </header>

      <div className="bg-[#0A0A0A] border border-[#262626] rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0A0A0A] border-b border-[#262626]">
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {users?.map((user) => (
                <tr key={user.id} className="group hover:bg-[#171717] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center text-xs font-bold text-[#A3A3A3] border border-[#262626]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-bold">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusColors[getStatus(user.id)]}`}>
                      {getStatus(user.id)}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {['ATTEND', 'ABSENT', 'UNKNOWN'].map((s) => (
                        <button
                          key={s}
                          onClick={() => updateAttendanceMutation.mutate({ userId: user.id, status: s })}
                          disabled={getStatus(user.id) === s}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all border ${
                            getStatus(user.id) === s 
                              ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg shadow-blue-900/40' 
                              : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700'
                          }`}
                          title={s}
                        >
                          {s === 'ATTEND' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
                          {s === 'ABSENT' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>}
                          {s === 'UNKNOWN' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/></svg>}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceAdminPage;
