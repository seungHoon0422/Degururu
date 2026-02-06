import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { announcementsApi, Announcement } from '../../api/announcements';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

const AnnouncementsAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: announcementsApi.getAnnouncements
  });

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Announcement, 'id' | 'created_at' | 'updated_at'>>();

  const createMutation = useMutation({
    mutationFn: announcementsApi.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setIsModalOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Announcement>) => announcementsApi.updateAnnouncement(editingAnnouncement!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
      setIsModalOpen(false);
      setEditingAnnouncement(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: announcementsApi.deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
    }
  });

  const onSubmit = (data: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingAnnouncement) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setValue('title', announcement.title);
    setValue('content', announcement.content);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    reset();
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Club <span className="text-blue-500">Notices</span>
          </h1>
          <p className="text-[#A3A3A3] mt-1 font-medium">Broadcast updates to all members.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-white text-black font-black px-6 py-3 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Compose
        </button>
      </header>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 text-center animate-pulse text-[#A3A3A3] font-bold uppercase tracking-widest">Loading announcements...</div>
        ) : announcements?.map((announcement) => (
          <div key={announcement.id} className="bg-[#0A0A0A] border border-[#262626] rounded-3xl p-8 hover:bg-[#171717] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-widest">
                  {announcement.created_at ? format(new Date(announcement.created_at), 'MMM d, yyyy') : 'N/A'}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#262626]" />
                <span className="text-blue-500/50 text-[10px] font-black uppercase tracking-widest">Notice</span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{announcement.title}</h3>
              <p className="text-[#A3A3A3] text-sm line-clamp-1 max-w-2xl">{announcement.content}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => openEditModal(announcement)}
                className="px-5 py-2.5 bg-[#171717] hover:bg-[#262626] text-white rounded-xl text-xs font-bold transition-all border border-[#262626]"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(announcement.id)}
                className="p-2.5 bg-[#171717] hover:bg-red-500/10 text-[#A3A3A3] hover:text-red-500 rounded-xl transition-all border border-[#262626]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-[#262626] w-full max-w-2xl rounded-[3rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            
            <h2 className="text-3xl font-black text-white uppercase italic mb-10">
              {editingAnnouncement ? 'Edit' : 'New'} <span className="text-blue-500">Notice</span>
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-2">Headline</label>
                <input 
                  {...register('title', { required: true })} 
                  className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-6 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-lg font-bold" 
                  placeholder="Enter a catchy title..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-2">Content</label>
                <textarea 
                  {...register('content', { required: true })} 
                  rows={8}
                  className="w-full bg-[#171717] border border-[#262626] rounded-[2rem] px-6 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none leading-relaxed" 
                  placeholder="Write your announcement here..."
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox"
                  {...register('is_pinned')}
                  className="rounded border-[#262626] bg-[#171717] text-blue-500 focus:ring-blue-500"
                />
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em]">Pin to top</label>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-[#171717] text-[#A3A3A3] font-bold rounded-2xl hover:bg-[#262626] transition-all">Discard</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                  {editingAnnouncement ? 'Update Notice' : 'Post Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsAdminPage;
