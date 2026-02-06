import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

const ScoreTrendPage: React.FC = () => {
  const { data: trend, isLoading } = useQuery({
    queryKey: ['score-trend'],
    queryFn: usersApi.getScoreTrend
  });

  if (isLoading) return <div className="text-zinc-500 animate-pulse font-black text-2xl">ANALYZING PERFORMANCE...</div>;

  const trendData = Array.isArray(trend) ? [...trend].reverse() : [];
  const currentAvg = trendData.length ? Math.round(trendData.reduce((acc, curr) => acc + curr.average, 0) / trendData.length) : 0;
  const bestAvg = trendData.length ? Math.max(...trendData.map(t => t.average)) : 0;
  const highestScore = trendData.length ? Math.max(...trendData.map(t => t.highest)) : 0;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase">ANALYTICS</h1>
        <p className="text-zinc-500 font-medium">Deep dive into your bowling evolution.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-[#171717] p-10 rounded-[2.5rem] border border-[#262626] flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div>
               <p className="text-[#525252] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Season Average</p>
               <h2 className="text-7xl font-black text-[#EDEDED] font-mono tracking-tighter">{currentAvg}</h2>
            </div>
            <div className="mt-8 flex items-center gap-2 text-blue-500 font-bold text-sm">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               Current Level
            </div>
        </div>

        <div className="bg-[#171717] p-10 rounded-[2.5rem] border border-[#262626] flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div>
               <p className="text-[#525252] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Best Average</p>
               <h2 className="text-7xl font-black text-white font-mono tracking-tighter">{Math.round(bestAvg)}</h2>
            </div>
            <p className="text-[#525252] font-bold text-[10px] uppercase tracking-widest mt-8">Peak Performance</p>
        </div>

        <div className="bg-[#171717] p-10 rounded-[2.5rem] border border-[#262626] flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div>
               <p className="text-[#525252] text-[10px] font-black uppercase tracking-[0.2em] mb-4">All-Time High</p>
               <h2 className="text-7xl font-black text-blue-500 font-mono tracking-tighter">{highestScore}</h2>
            </div>
            <div className="flex gap-1 mt-8">
               {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-1 bg-blue-500/10 rounded-full overflow-hidden">
                 <div className={`h-full bg-blue-500 ${i < 5 ? 'w-full' : 'w-1/2'}`} />
               </div>)}
            </div>
        </div>
      </div>

      <div className="bg-[#171717] border border-[#262626] rounded-[3rem] p-12">
        <div className="flex justify-between items-center mb-12">
           <h3 className="text-2xl font-black text-white uppercase tracking-tight">Progress Over Time</h3>
           <div className="flex gap-6">
              <span className="flex items-center gap-2 text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> AVERAGE
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black text-[#A3A3A3] uppercase tracking-widest">
                <span className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500" /> HIGHEST
              </span>
           </div>
        </div>
        
        <div className="h-[440px] w-full">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="starts_at" 
                  stroke="#525252" 
                  fontSize={11} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  dy={10} 
                  tickFormatter={(val) => format(new Date(val), 'MMM d')}
                  fontFamily="Geist Mono"
                />
                <YAxis 
                  stroke="#525252" 
                  fontSize={11} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 300]}
                  fontFamily="Geist Mono"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid #262626', borderRadius: '16px', padding: '16px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ fontWeight: '900', fontSize: '14px' }}
                  labelStyle={{ color: '#A3A3A3', marginBottom: '8px', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                  labelFormatter={(val, items) => {
                    const item = items[0]?.payload;
                    return item ? `${item.title} (${format(new Date(val), 'yyyy-MM-dd')})` : val;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorAvg)" 
                  dot={{ r: 4, fill: '#0A0A0A', stroke: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="highest" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  fill="transparent"
                  dot={{ r: 3, fill: '#171717', stroke: '#3b82f6', strokeWidth: 1 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#525252] font-black border-2 border-dashed border-[#262626] rounded-3xl uppercase tracking-[0.2em] text-sm">
              Insufficient data for trend analysis
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScoreTrendPage;

