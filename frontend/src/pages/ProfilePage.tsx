import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: usersApi.getMe });
  
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [description, setDescription] = useState(user?.description || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: usersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('PROFILE UPDATED');
    },
    onError: () => toast.error('UPDATE FAILED')
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ oldPass, newPass }: { oldPass: string, newPass: string }) => 
      usersApi.changePassword(oldPass, newPass),
    onSuccess: () => {
      setOldPassword('');
      setNewPassword('');
      toast.success('PASSWORD CHANGED');
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'CHANGE FAILED')
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ nickname, description });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate({ oldPass: oldPassword, newPass: newPassword });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">MY PROFILE</h1>
        <p className="text-zinc-500 font-medium">Manage your identity and security.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Profile Info Form */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full" />
            General Info
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email</label>
              <input 
                type="text" 
                value={user?.email || ''} 
                disabled 
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-500 px-4 py-3 rounded-xl cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Nickname</label>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)}
                placeholder={user?.nickname}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your bowling style..."
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none"
              />
            </div>
            <button 
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full bg-white text-black font-black py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'SAVING...' : 'UPDATE PROFILE'}
            </button>
          </form>
        </section>

        {/* Security Form */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
            Security
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Current Password</label>
              <input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                required
                minLength={8}
              />
            </div>
            <button 
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full bg-zinc-800 text-white font-black py-3 rounded-xl hover:bg-zinc-700 transition-all disabled:opacity-50"
            >
              {changePasswordMutation.isPending ? 'UPDATING...' : 'CHANGE PASSWORD'}
            </button>
          </form>

          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-400 mb-2 uppercase tracking-wider">Account Role</h3>
            <p className="text-white font-black text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {user?.role?.toUpperCase() || 'MEMBER'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
