import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulesApi, Schedule } from '../../api/schedules';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

const SchedulesAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['admin', 'schedules'],
    queryFn: schedulesApi.getSchedules
  });

  const { register, handleSubmit, reset, setValue } = useForm<Omit<Schedule, 'id'>>();

  const createMutation = useMutation({
    mutationFn: schedulesApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      setIsModalOpen(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Schedule>) => schedulesApi.updateSchedule(editingSchedule!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
      setIsModalOpen(false);
      setEditingSchedule(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: schedulesApi.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schedules'] });
    }
  });

  const onSubmit = (data: Omit<Schedule, 'id'>) => {
    if (editingSchedule) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setValue('title', schedule.title);
    setValue('location', schedule.location);
    setValue('notes', schedule.notes);
    setValue('starts_at', schedule.starts_at ? format(new Date(schedule.starts_at), "yyyy-MM-dd'T'HH:mm") : "");
    setValue('is_cancelled', schedule.is_cancelled);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingSchedule(null);
    reset({
        title: '',
        location: '',
        notes: '',
        starts_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        is_cancelled: false,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete session: ${title}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Bowling <span className="text-blue-500">Schedules</span>
          </h1>
          <p className="text-[#A3A3A3] mt-1 font-medium">Create and manage upcoming sessions.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-white text-black font-black px-6 py-3 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-xl active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          New Session
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-[#A3A3A3] animate-pulse font-bold uppercase tracking-widest">
            Fetching sessions...
          </div>
        ) : schedules?.map((schedule) => (
          <div key={schedule.id} className="bg-[#0A0A0A] border border-[#262626] rounded-3xl p-6 hover:border-[#3F3F46] transition-all group relative">
            <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              schedule.is_cancelled ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {schedule.is_cancelled ? 'Cancelled' : 'Active'}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 pr-20">{schedule.title}</h3>
            <p className="text-[#A3A3A3] text-sm mb-6 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {schedule.location}
            </p>
            
            <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-[#EDEDED] text-xs font-bold bg-[#171717] p-3 rounded-xl border border-[#262626]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {schedule.starts_at ? format(new Date(schedule.starts_at), 'PPP p') : 'N/A'}
                </div>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                to={`/admin/schedules/${schedule.id}/attendance`}
                className="flex-1 bg-[#171717] hover:bg-[#262626] text-white text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors border border-[#262626]"
              >
                Attendance
              </Link>
              <button 
                onClick={() => openEditModal(schedule)}
                className="p-3 bg-[#171717] hover:bg-[#262626] text-[#A3A3A3] hover:text-white rounded-xl transition-colors border border-[#262626]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
              </button>
              <button 
                onClick={() => handleDelete(schedule.id, schedule.title)}
                className="p-3 bg-[#171717] hover:bg-red-500/10 text-[#A3A3A3] hover:text-red-500 rounded-xl transition-colors border border-[#262626]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-[#262626] w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            
            <h2 className="text-2xl font-black text-white uppercase italic mb-8">
              {editingSchedule ? 'Edit' : 'Create'} <span className="text-blue-500">Session</span>
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Title</label>
                <input {...register('title', { required: true })} className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold" />
              </div>
              
              <div className="space-y-2">
                  <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Start Time</label>
                  <input type="datetime-local" {...register('starts_at', { required: true })} className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Location</label>
                <input {...register('location', { required: true })} className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Notes</label>
                <textarea {...register('notes')} rows={3} className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none leading-relaxed font-medium" />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox"
                  {...register('is_cancelled')}
                  className="rounded border-[#262626] bg-[#171717] text-blue-500 focus:ring-blue-500"
                />
                <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em]">Cancelled</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-[#171717] text-[#A3A3A3] font-bold rounded-2xl hover:bg-[#262626] transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                  {editingSchedule ? 'Save Changes' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesAdminPage;
