import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '../api/schedules';
import { usersApi } from '../api/users';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ScheduleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [scoresInput, setScoresInput] = useState<string>('');

  const { data: user } = useQuery({ queryKey: ['me'], queryFn: usersApi.getMe });

  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ['schedule', id],
    queryFn: () => schedulesApi.getSchedule(id!),
    enabled: !!id,
  });

  const { data: allAttendance } = useQuery({
    queryKey: ['attendance', id],
    queryFn: () => schedulesApi.getScheduleAttendance(id!),
    enabled: !!id,
  });

  const { data: allScores } = useQuery({
    queryKey: ['scores', id],
    queryFn: () => schedulesApi.getScheduleScores(id!),
    enabled: !!id,
  });

  const myAttendance = allAttendance?.find(a => a.user_id === user?.id);
  const myScores = allScores?.filter(s => s.user_id === user?.id).sort((a, b) => a.game_no - b.game_no) || [];

  const attendanceMutation = useMutation({
    mutationFn: (status: string) => schedulesApi.updateMyAttendance(id!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance', id] }),
  });

  const scoreMutation = useMutation({
    mutationFn: async (scoreData: { score: number, game_no: number }) => 
      schedulesApi.submitScores(id!, scoreData.score, scoreData.game_no),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', id] });
    },
  });

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedScores = scoresInput.split(',').map(s => parseInt(s.trim())).filter(s => !isNaN(s));
    
    // Submit scores sequentially
    for (let i = 0; i < parsedScores.length; i++) {
      await scoreMutation.mutateAsync({ score: parsedScores[i], game_no: i + 1 });
    }
    setScoresInput('');
  };

  if (isLoadingSchedule || !schedule) return <div className="text-[#A3A3A3] animate-pulse font-mono text-2xl tracking-tighter">LOADING_SESSION...</div>;

  const chartData = myScores.map((s) => ({
    game: `G${s.game_no}`,
    score: s.score,
  }));

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <Link to="/schedules" className="text-[#A3A3A3] hover:text-white transition-colors flex items-center gap-2 font-bold text-[12px] group font-mono uppercase tracking-widest">
        <svg className="group-hover:-translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Sessions
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="bg-blue-500/10 text-[#3B82F6] px-3 py-1 rounded-md text-[10px] font-black tracking-[0.2em] border border-blue-500/20 uppercase">
                Session Detail
             </span>
             <span className="text-[#525252] font-mono text-[12px] font-bold">
                #{id?.slice(0, 8).toUpperCase()}
             </span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white uppercase leading-[0.9]">
            {schedule.title}
          </h1>
          <div className="flex flex-wrap gap-8 text-[#A3A3A3] font-mono font-bold text-[13px] pt-2">
            <div className="flex items-center gap-2">
              <svg className="text-[#525252]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {schedule.location}
            </div>
            <div className="flex items-center gap-2">
              <svg className="text-[#525252]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {schedule.starts_at ? format(new Date(schedule.starts_at), 'EEEE, MMM d • HH:mm') : 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-[#171717] p-8 rounded-2xl border border-[#262626] min-w-[300px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-blue-500/10" />
          <h3 className="text-[#525252] text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
             Your Status
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between">
              <span className={`text-4xl font-black tracking-tighter uppercase transition-colors ${myAttendance?.status === 'ATTEND' ? 'text-[#3B82F6]' : 'text-[#404040]'}`}>
                {myAttendance?.status || 'PENDING'}
              </span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => attendanceMutation.mutate('ATTEND')}
                className={`flex-1 py-4 rounded-xl text-[12px] font-black tracking-widest transition-all duration-300 border ${myAttendance?.status === 'ATTEND' ? 'bg-[#3B82F6] border-[#3B82F6] text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'bg-transparent border-[#262626] text-[#A3A3A3] hover:border-[#404040] hover:text-white'}`}
              >
                ATTEND
              </button>
              <button 
                onClick={() => attendanceMutation.mutate('ABSENT')}
                className={`flex-1 py-4 rounded-xl text-[12px] font-black tracking-widest transition-all duration-300 border ${myAttendance?.status === 'ABSENT' ? 'bg-white border-white text-black' : 'bg-transparent border-[#262626] text-[#A3A3A3] hover:border-[#404040] hover:text-white'}`}
              >
                ABSENT
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scores Graph */}
        <div className="lg:col-span-2 bg-[#171717] border border-[#262626] rounded-2xl p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6]/20 to-transparent" />
          <h3 className="text-white font-black text-2xl mb-10 uppercase tracking-tight flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#3B82F6]" />
            Performance Graph
          </h3>
          <div className="h-[320px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="game" 
                    stroke="#525252" 
                    fontSize={12} 
                    fontFamily="Geist Mono"
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={12} 
                    fontFamily="Geist Mono"
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 300]} 
                    ticks={[0, 100, 200, 300]}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#262626', strokeWidth: 2 }}
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', padding: '12px' }}
                    labelStyle={{ color: '#525252', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'Geist Mono' }}
                    itemStyle={{ color: '#3B82F6', fontWeight: '900', fontSize: '16px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3B82F6" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#171717', stroke: '#3B82F6', strokeWidth: 3 }} 
                    activeDot={{ r: 6, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} 
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#525252] font-mono font-bold border-2 border-dashed border-[#262626] rounded-2xl text-center px-6 uppercase tracking-tight leading-relaxed">
                No score data recorded<br/>Submit your scores to visualize performance
              </div>
            )}
          </div>
        </div>

        {/* Score Input */}
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-10 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#3B82F6]/5 blur-3xl rounded-full -mr-16 -mt-16" />
          <div>
            <h3 className="text-white font-black text-2xl mb-3 uppercase tracking-tight">Post Scores</h3>
            <p className="text-[#A3A3A3] text-[13px] mb-10 font-medium leading-relaxed">Enter game scores separated by commas.<br/><span className="text-[#525252] font-mono">(e.g. 180, 210, 195)</span></p>
            
            <form onSubmit={handleScoreSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#525252] uppercase tracking-[0.3em] ml-1">Score Matrix</label>
                <input 
                  type="text" 
                  value={scoresInput}
                  onChange={(e) => setScoresInput(e.target.value)}
                  placeholder="---, ---, ---"
                  className="w-full bg-black border border-[#262626] text-white text-4xl font-black px-6 py-10 rounded-2xl focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all placeholder:text-[#262626] text-center font-mono tracking-widest"
                />
              </div>
              <button 
                type="submit"
                disabled={scoreMutation.isPending}
                className="w-full bg-white text-black font-black py-5 rounded-xl hover:bg-[#3B82F6] hover:text-white transition-all duration-300 transform active:scale-[0.98] disabled:opacity-30 tracking-widest text-[12px]"
              >
                {scoreMutation.isPending ? 'UPLOADING...' : 'SUBMIT SCORES'}
              </button>
            </form>
          </div>
          
          <div className="mt-12 pt-8 border-t border-[#262626]">
             <div className="flex justify-between items-center text-[#525252] font-mono font-bold text-[11px] uppercase tracking-widest">
                <span>Session Avg</span>
                <span className="text-2xl text-white font-black tracking-tighter">
                  {chartData.length > 0 ? Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length) : '---'}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailPage;
