import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { format } from 'date-fns';

const AttendancePage: React.FC = () => {
  const { data: attendanceHistory, isLoading } = useQuery({
    queryKey: ['attendance-history'],
    queryFn: usersApi.getAllAttendance
  });

  if (isLoading) return <div className="text-zinc-500 animate-pulse font-black text-2xl">LOADING...</div>;

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <header>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">Attendance</h1>
        <p className="text-zinc-500 font-medium">Your historical attendance records and streaks.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Sessions</p>
           <p className="text-4xl font-black text-white">{attendanceHistory?.length || 0}</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Present</p>
           <p className="text-4xl font-black text-green-500">
             {attendanceHistory?.filter((a: any) => a.status === 'present').length || 0}
           </p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Rate</p>
           <p className="text-4xl font-black text-blue-500">
             {attendanceHistory?.length ? Math.round((attendanceHistory.filter((a: any) => a.status === 'present').length / attendanceHistory.length) * 100) : 0}%
           </p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Current Streak</p>
           <p className="text-4xl font-black text-purple-500">5</p>
        </div>
      </div>

      <div className="bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-8 py-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">Date</th>
              <th className="px-8 py-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">Session Title</th>
              <th className="px-8 py-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {attendanceHistory?.map((record: any) => (
              <tr key={record.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-8 py-6 font-bold text-zinc-400">
                  {format(new Date(record.startTime || new Date()), 'yyyy.MM.dd')}
                </td>
                <td className="px-8 py-6 font-black text-white text-lg">
                  {record.scheduleTitle || 'Regular Session'}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    record.status === 'present' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right font-black text-zinc-500 group-hover:text-blue-500 transition-colors">
                  +10 XP
                </td>
              </tr>
            ))}
            {!attendanceHistory?.length && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-zinc-600 font-bold italic">
                  No attendance history yet. Start bowling!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
