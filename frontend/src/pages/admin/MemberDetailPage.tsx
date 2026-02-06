import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserProfile } from '../../api/users';
import { useForm } from 'react-hook-form';

const MemberDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => usersApi.getUser(id!),
    enabled: !!id
  });

  const { register, handleSubmit, formState: { errors } } = useForm<Partial<UserProfile>>({
    values: user
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => usersApi.updateUser(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
      alert('Member updated successfully!');
      navigate('/admin/members');
    }
  });

  const onSubmit = (data: Partial<UserProfile>) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <div className="p-8 text-zinc-500 animate-pulse">Loading member details...</div>;
  if (!user) return <div className="p-8 text-zinc-500 text-center">Member not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <header className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 rounded-2xl bg-[#0A0A0A] border border-[#262626] text-[#A3A3A3] hover:text-white hover:border-[#3F3F46] transition-all"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Edit <span className="text-blue-500">Member</span>
          </h1>
          <p className="text-[#A3A3A3] font-medium">Modifying profile for {user.name}</p>
        </div>
      </header>

      <div className="bg-[#0A0A0A] border border-[#262626] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Name</label>
              <input 
                {...register('name', { required: 'Name is required' })}
                className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-700 font-bold"
                placeholder="Member name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{(errors.name as any).message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                {...register('email')}
                disabled
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-2xl px-5 py-4 text-[#A3A3A3] cursor-not-allowed opacity-60 font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Account Role</label>
              <select 
                {...register('role')}
                className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-bold"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Membership Type</label>
              <select 
                {...register('member_type')}
                className="w-full bg-[#171717] border border-[#262626] rounded-2xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer font-bold"
              >
                <option value="FULL">정회원 (Full)</option>
                <option value="ASSOCIATE">준회원 (Associate)</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[#A3A3A3] text-[10px] font-black uppercase tracking-[0.2em] ml-1">Bio / Description</label>
              <textarea 
                {...register('description')}
                rows={4}
                className="w-full bg-[#171717] border border-[#262626] rounded-3xl px-5 py-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-zinc-700 resize-none font-medium leading-relaxed"
                placeholder="Brief description about the member..."
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-2xl bg-[#171717] text-[#A3A3A3] font-bold hover:bg-[#262626] hover:text-white transition-all border border-[#262626]"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={updateMutation.isPending}
              className="px-10 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/5"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberDetailPage;
