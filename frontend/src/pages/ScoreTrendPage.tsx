import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Line } from 'recharts';

const ScoreTrendPage: React.FC = () => {
  const { data: trend, isLoading } = useQuery({
    queryKey: ['score-trend'],
    queryFn: usersApi.getScoreTrend
  });

  if (isLoading) return <div className="text-zinc-500 animate-pulse font-black text-2xl">ANALYZING PERFORMANCE...</div>;

  const currentAvg = trend?.length ? Math.round(trend.reduce((acc, curr) => acc + curr.average, 0) / trend.length) : 0;
  const bestAvg = trend?.length ? Math.max(...trend.map(t => t.average)) : 0;
  const highestScore = trend?.length ? Math.max(...trend.map(t => t.highest)) : 0;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">ANALYTICS</h1>
        <p className="text-zinc-500 font-medium">Deep dive into your bowling evolution.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between">
           <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Season Average</p>
              <h2 className="text-7xl font-black text-white">{currentAvg}</h2>
           </div>
           <div className="mt-8 flex items-center gap-2 text-green-500 font-bold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              +12 from last month
           </div>
        </div>

        <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between">
           <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Best Average</p>
              <h2 className="text-7xl font-black text-blue-500">{bestAvg}</h2>
           </div>
           <p className="text-zinc-600 font-bold text-sm">Achieved on Oct 24, 2025</p>
        </div>

        <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between">
           <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">All-Time High</p>
              <h2 className="text-7xl font-black text-purple-500">{highestScore}</h2>
           </div>
           <div className="flex gap-1 mt-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-1 bg-purple-500/20 rounded-full overflow-hidden">
                <div className={`h-full bg-purple-500 ${i < 4 ? 'w-full' : 'w-0'}`} />
              </div>)}
           </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-[3rem] p-12">
        <div className="flex justify-between items-center mb-12">
           <h3 className="text-2xl font-black text-white uppercase tracking-tight">Progress Over Time</h3>
           <div className="flex gap-2">
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> AVERAGE
              </span>
              <span className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                <span className="w-3 h-3 rounded-full bg-purple-500/30 border border-purple-500" /> HIGHEST
              </span>
           </div>
        </div>
        
        <div className="h-[400px] w-full">
          {trend?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 20', 'dataMax + 20']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #1f2937', borderRadius: '16px', padding: '12px' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAvg)" />
                <Line type="monotone" dataKey="highest" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600 font-bold border-2 border-dashed border-zinc-800 rounded-3xl">
              INSUFFICIENT DATA FOR TREND ANALYSIS
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreTrendPage;
