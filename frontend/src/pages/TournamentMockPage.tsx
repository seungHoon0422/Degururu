import React from 'react';

const TournamentMockPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] -z-10 animate-pulse" />

      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-20">
        <div>
           <div className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-4">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              Upcoming Event
           </div>
           <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              Grand Slam <br /> <span className="text-transparent stroke-text">2026</span>
           </h1>
        </div>
        <div className="text-right">
           <p className="text-zinc-500 font-black text-sm uppercase tracking-widest mb-2">Total Prize Pool</p>
           <p className="text-5xl font-black text-white">$2,500.00</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Tournament Bracket Mockup */}
        <div className="lg:col-span-8 space-y-12">
           <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
              Qualifiers Bracket
              <div className="h-px flex-1 bg-zinc-800" />
           </h2>

           <div className="grid grid-cols-2 md:grid-cols-3 gap-8 relative">
              {/* Round 1 */}
              <div className="space-y-6">
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Quarter-Finals</p>
                 {[1, 2, 3].map(i => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2 relative group hover:border-red-500/50 transition-all cursor-pointer">
                       <div className="flex justify-between items-center opacity-50 group-hover:opacity-100">
                          <span className="text-xs font-bold">STRIKE MASTER</span>
                          <span className="font-black text-xs">210</span>
                       </div>
                       <div className="h-px bg-zinc-800" />
                       <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-red-500">PIN CRUSHER</span>
                          <span className="font-black text-xs text-red-500">245</span>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Round 2 */}
              <div className="space-y-6 pt-12">
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Semi-Finals</p>
                 {[1, 2].map(i => (
                    <div key={i} className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 space-y-3 shadow-2xl shadow-red-500/5">
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-black">TBD</span>
                          <span className="font-black text-sm opacity-20">---</span>
                       </div>
                       <div className="h-px bg-zinc-800" />
                       <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-zinc-600">PENDING</span>
                          <span className="font-black text-sm opacity-20">---</span>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Final */}
              <div className="space-y-6 pt-24">
                 <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">Grand Final</p>
                 <div className="bg-gradient-to-br from-red-600 to-purple-600 rounded-[2rem] p-1">
                    <div className="bg-black rounded-[1.9rem] p-8 flex flex-col items-center justify-center text-center">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-red-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                       <span className="text-xs font-black tracking-widest uppercase text-zinc-400">Championship</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Info Panel */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-md">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Event Details</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-red-500">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    </div>
                    <div>
                       <p className="text-zinc-500 text-[10px] font-black uppercase">Date</p>
                       <p className="font-bold">March 14, 2026</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-red-500">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div>
                       <p className="text-zinc-500 text-[10px] font-black uppercase">Location</p>
                       <p className="font-bold">Neo-Seoul Bowling Center</p>
                    </div>
                 </div>
              </div>
              <button className="w-full bg-white text-black font-black py-4 rounded-2xl mt-12 hover:bg-red-500 hover:text-white transition-all">
                 REGISTER NOW
              </button>
           </div>

           <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10">
              <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-6 text-center">Sponsored By</h3>
              <div className="grid grid-cols-2 gap-8 opacity-30 grayscale contrast-125">
                 <div className="h-8 bg-zinc-700 rounded-lg animate-pulse" />
                 <div className="h-8 bg-zinc-700 rounded-lg animate-pulse" />
                 <div className="h-8 bg-zinc-700 rounded-lg animate-pulse" />
                 <div className="h-8 bg-zinc-700 rounded-lg animate-pulse" />
              </div>
           </div>
        </div>
      </main>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1px rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
};

export default TournamentMockPage;
