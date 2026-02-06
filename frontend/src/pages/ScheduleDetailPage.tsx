import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesApi } from '../api/schedules';
import { usersApi } from '../api/users';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Save, ChevronLeft, Trophy, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ScoreRow {
  game_no: number;
  score: string;
}

const ScheduleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [scoreRows, setScoreRows] = useState<ScoreRow[]>([
    { game_no: 1, score: '' },
    { game_no: 2, score: '' },
    { game_no: 3, score: '' },
    { game_no: 4, score: '' },
    { game_no: 5, score: '' },
  ]);

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

  const { data: scheduleStats } = useQuery({
    queryKey: ['schedule-stats', id],
    queryFn: () => id ? schedulesApi.getScheduleStats(id) : Promise.reject('No ID'),
    enabled: !!id,
  });

  const { data: myHigh } = useQuery({
    queryKey: ['me-high'],
    queryFn: usersApi.getMeHighScore,
  });

  const myAttendance = allAttendance?.find(a => a.user_id === user?.id);
  const myScoresFromApi = allScores?.filter(s => s.user_id === user?.id).sort((a, b) => a.game_no - b.game_no) || [];

  useEffect(() => {
    if (myScoresFromApi.length > 0) {
      const existingRows = myScoresFromApi.map(s => ({
        game_no: s.game_no,
        score: s.score.toString(),
      }));
      
      // Ensure at least 5 rows or as many as existing rows
      const finalRows = [...existingRows];
      const minRows = Math.max(5, existingRows.length);
      while (finalRows.length < minRows) {
        finalRows.push({ game_no: finalRows.length + 1, score: '' });
      }
      setScoreRows(finalRows);
    }
  }, [JSON.stringify(myScoresFromApi)]);

  const attendanceMutation = useMutation({
    mutationFn: (status: string) => schedulesApi.updateMyAttendance(id!, status),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', id] });
      toast.success(`ATTENDANCE: ${data.status}`);
    },
    onError: () => toast.error('ATTENDANCE FAILED'),
  });

  const scoreMutation = useMutation({
    mutationFn: async (scoreData: { score: number, game_no: number }) => 
      schedulesApi.submitScores(id!, scoreData.score, scoreData.game_no),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', id] });
      queryClient.invalidateQueries({ queryKey: ['schedule-stats', id] });
      queryClient.invalidateQueries({ queryKey: ['score-trend'] });
      queryClient.invalidateQueries({ queryKey: ['me-high'] });
    },
  });

  const handleScoreChange = (index: number, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    const num = parseInt(value);
    if (!isNaN(num) && num > 300) value = '300';

    const newRows = [...scoreRows];
    newRows[index].score = value;
    setScoreRows(newRows);
  };

  const addRow = () => {
    setScoreRows([...scoreRows, { game_no: scoreRows.length + 1, score: '' }]);
  };

  const removeRow = (index: number) => {
    if (scoreRows.length <= 1) return;
    const newRows = scoreRows.filter((_, i) => i !== index).map((row, i) => ({
      ...row,
      game_no: i + 1
    }));
    setScoreRows(newRows);
  };

  const handleSaveScores = async () => {
    const validScores = scoreRows
      .map(row => ({ game_no: row.game_no, score: parseInt(row.score) }))
      .filter(s => !isNaN(s.score));
    
    if (validScores.length === 0) return;

    try {
      for (const s of validScores) {
        await scoreMutation.mutateAsync(s);
      }
      toast.success('SCORES SAVED');
    } catch (error) {
      console.error('Failed to save scores', error);
      toast.error('SAVE FAILED');
    }
  };

  if (isLoadingSchedule || !schedule) return (
    <div className="min-h-screen flex items-center justify-center bg-black font-mono text-[#3B82F6] animate-pulse uppercase tracking-[0.5em]">
      Syncing_Data...
    </div>
  );

  const myScoresForChart = scoreRows
    .map(r => ({
      game: `G${r.game_no}`,
      score: r.score !== '' ? parseInt(r.score) : null
    }))
    .filter(r => r.score !== null && !isNaN(r.score as number));

  const mySessionAvg = myScoresForChart.length > 0
    ? Math.round(myScoresForChart.reduce((acc, curr) => acc + (curr.score as number), 0) / myScoresForChart.length)
    : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <Link to="/schedules" className="text-[#A3A3A3] hover:text-white transition-colors flex items-center gap-2 font-bold text-xs group w-fit uppercase tracking-widest font-mono">
        <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
        Back to Sessions
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
               Session Detail
             </span>
             <span className="text-[#525252] font-mono text-xs">#{id?.slice(0, 8).toUpperCase()}</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-[#EDEDED] uppercase leading-[0.9]">
            {schedule.title}
          </h1>
          <div className="flex flex-wrap gap-8 text-[#A3A3A3] font-mono font-bold text-[13px] pt-2">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {schedule.location}
            </div>
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {schedule.starts_at ? format(new Date(schedule.starts_at), 'EEEE, MMM d • HH:mm') : 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-[#171717] p-8 rounded-2xl border border-[#262626] min-w-[320px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/10" />
          <h3 className="text-[#525252] text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
             Participation
          </h3>
          <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between">
              <span className={`text-4xl font-black tracking-tighter uppercase transition-colors ${myAttendance?.status === 'ATTEND' ? 'text-blue-500' : 'text-[#404040]'}`}>
                {myAttendance?.status || 'UNKNOWN'}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => attendanceMutation.mutate('ATTEND')}
                className={`flex-1 py-4 rounded-xl text-[12px] font-black tracking-widest transition-all ${myAttendance?.status === 'ATTEND' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-[#0A0A0A] text-[#A3A3A3] border border-[#262626] hover:border-[#333333]'}`}
              >
                ATTEND
              </button>
              <button 
                onClick={() => attendanceMutation.mutate('ABSENT')}
                className={`flex-1 py-4 rounded-xl text-[12px] font-black tracking-widest transition-all ${myAttendance?.status === 'ABSENT' ? 'bg-white text-black' : 'bg-[#0A0A0A] text-[#A3A3A3] border border-[#262626] hover:border-[#333333]'}`}
              >
                ABSENT
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6">
                <p className="text-[#525252] text-[10px] font-black uppercase tracking-widest mb-3">Overall Avg</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#EDEDED] font-mono tracking-tighter">{Math.round(scheduleStats?.average || 0)}</span>
                  <Trophy size={14} className="text-blue-500 opacity-50" />
                </div>
             </div>
              <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6">
                <p className="text-[#525252] text-[10px] font-black uppercase tracking-widest mb-3">All Time High</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-blue-500 font-mono tracking-tighter">{myHigh?.high_score ?? '---'}</span>
                </div>
              </div>
              <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6">
                <p className="text-[#525252] text-[10px] font-black uppercase tracking-widest mb-3">Participants</p>
                <span className="text-4xl font-black text-[#EDEDED] font-mono tracking-tighter">{scheduleStats?.count || 0}</span>
              </div>
          </div>

          {/* Performance Graph */}
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-10 flex flex-col h-[500px]">
            <h3 className="text-[#EDEDED] font-black text-2xl uppercase tracking-tight mb-10 flex items-center gap-3">
              <div className="w-8 h-[2px] bg-blue-500" />
              Live Performance
            </h3>
            <div className="flex-1 w-full min-h-0">
              {myScoresForChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart 
                    data={myScoresForChart}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                    <XAxis 
                      dataKey="game" 
                      stroke="#525252" 
                      fontSize={11} 
                      fontWeight="900" 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10} 
                      fontFamily="Geist Mono" 
                    />
                    <YAxis 
                      stroke="#525252" 
                      fontSize={11} 
                      fontWeight="900" 
                      tickLine={false} 
                      axisLine={false} 
                      domain={[0, 300]} 
                      fontFamily="Geist Mono" 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #262626', borderRadius: '12px' }}
                      itemStyle={{ color: '#3B82F6', fontWeight: '900' }}
                      formatter={(value: any, _name: any, props: any) => [`${value} Pts`, `Game ${props.payload.game.replace('G', '')}`]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3B82F6" 
                      strokeWidth={5} 
                      dot={{ r: 6, fill: '#0A0A0A', stroke: '#3B82F6', strokeWidth: 3 }} 
                      activeDot={{ r: 10, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} 
                      isAnimationActive={true}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[#525252] font-black border-2 border-dashed border-[#262626] rounded-3xl text-center px-8 uppercase tracking-widest text-sm">
                  Waiting for score data...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Table-based Score Input */}
        <div className="lg:col-span-5 bg-[#171717] border border-[#262626] rounded-2xl p-10 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col h-full">
            <header className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter leading-none">Record Scores</h3>
                <p className="text-[#525252] font-mono text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Manual Entry (Keyboard Optimized)</p>
              </div>
              <button 
                onClick={addRow}
                className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-400 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                title="Add New Game Row"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar mb-8">
              {scoreRows.map((row, index) => (
                <div key={`${row.game_no}-${index}`} className="flex items-center gap-4 group">
                  <input 
                    type="text"
                    inputMode="numeric"
                    value={row.score}
                    onChange={(e) => handleScoreChange(index, e.target.value)}
                    placeholder={`Game ${row.game_no}`}
                    className="flex-1 bg-[#0A0A0A] border border-[#262626] rounded-xl px-5 py-4 text-[#EDEDED] text-xl font-mono font-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-[#262626] text-center"
                  />
                  <button 
                    onClick={() => removeRow(index)}
                    disabled={scoreRows.length <= 1}
                    className="p-3 text-[#262626] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:hidden"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-6 bg-[#0A0A0A] border border-[#262626] rounded-2xl">
                <div className="space-y-1">
                  <p className="text-[#525252] text-[10px] font-black uppercase tracking-widest">Game Count</p>
                  <p className="text-3xl font-black text-blue-500 font-mono tracking-tighter">
                    {myScoresForChart.length}
                  </p>
                </div>
                <div className="text-right space-y-1 border-l border-[#262626] pl-6">
                  <p className="text-[#525252] text-[10px] font-black uppercase tracking-widest">Your Avg</p>
                  <p className="text-3xl font-black text-[#EDEDED] font-mono tracking-tighter">{mySessionAvg}</p>
                </div>
              </div>
              
              <button 
                onClick={handleSaveScores}
                disabled={scoreMutation.isPending}
                className="w-full bg-[#EDEDED] text-black font-black py-5 rounded-2xl hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-30 uppercase tracking-widest text-xs"
              >
                {scoreMutation.isPending ? (
                   <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Commit Scores to Database
              </button>
              
              <div className="flex items-start gap-2 px-2 text-[#525252]">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p className="text-[10px] font-medium leading-tight italic">
                  Scores are saved individually per game. Make sure all entries are correct before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailPage;
