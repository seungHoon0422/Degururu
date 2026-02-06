import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { announcementsApi } from '../api/announcements';
import { format } from 'date-fns';

const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: notice, isLoading } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => announcementsApi.getAnnouncement(id!),
    enabled: !!id
  });

  if (isLoading) return <div className="text-zinc-500 animate-pulse font-black text-2xl text-center mt-20">READING...</div>;
  if (!notice) return <div className="text-zinc-500 font-black text-2xl text-center mt-20">NOT FOUND</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 animate-in fade-in duration-500">
      <Link to="/announcements" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-xs mb-12 uppercase tracking-widest group">
        <svg className="group-hover:-translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Announcements
      </Link>

      <article className="space-y-12">
        <header className="space-y-6">
          <div className="flex items-center gap-4">
             <span className="bg-blue-600 h-1 w-12 rounded-full" />
             <time className="text-zinc-500 font-black text-xs uppercase tracking-widest">
               {notice.created_at ? format(new Date(notice.created_at), 'MMMM d, yyyy') : 'N/A'}
             </time>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter">
            {notice.title}
          </h1>
        </header>

        <div className="w-full h-px bg-zinc-800" />

        <div className="prose prose-invert prose-zinc max-w-none">
          <p className="text-zinc-400 text-xl leading-relaxed whitespace-pre-wrap font-medium">
            {notice.content}
          </p>
        </div>

        <footer className="pt-12">
           <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800 flex items-center justify-between">
              <div>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Posted By</p>
                 <p className="text-white font-bold">System Administrator</p>
              </div>
              <div className="flex gap-2">
                 <button className="p-3 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
                 </button>
              </div>
           </div>
        </footer>
      </article>
    </div>
  );
};

export default AnnouncementDetailPage;
