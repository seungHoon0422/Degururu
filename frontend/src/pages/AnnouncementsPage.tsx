import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../api/announcements';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const AnnouncementsPage: React.FC = () => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: announcementsApi.getAnnouncements
  });

  if (isLoading) return <div className="text-zinc-500 animate-pulse font-black text-2xl">FETCHING NEWS...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center">
        <h1 className="text-6xl font-black tracking-tight text-white uppercase mb-4">Notices</h1>
        <p className="text-zinc-500 font-medium">Official updates from the Degururu committee.</p>
      </header>

      <div className="space-y-6">
        {announcements?.map((notice) => (
          <Link 
            key={notice.id} 
            to={`/announcements/${notice.id}`}
            className="block group bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 p-8 rounded-3xl transition-all"
          >
            <div className="flex justify-between items-start mb-4">
               <span className="text-zinc-600 font-black text-[10px] tracking-widest uppercase">
                 {notice.created_at ? format(new Date(notice.created_at), 'MMMM d, yyyy') : 'N/A'}
               </span>
               <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
               </div>
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-blue-500 transition-colors mb-4 leading-tight">
              {notice.title}
            </h2>
            <p className="text-zinc-500 line-clamp-2 text-sm leading-relaxed">
              {notice.content}
            </p>
          </Link>
        ))}
        {!announcements?.length && (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
            <p className="text-zinc-600 font-bold italic">No announcements posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
