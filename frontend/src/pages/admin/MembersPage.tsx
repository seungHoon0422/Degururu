import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, UserProfile } from '../../api/users';
import { Link } from 'react-router-dom';

const MembersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.getUsers
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    }
  });

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Member <span className="text-blue-500">Directory</span>
          </h1>
          <p className="text-[#A3A3A3] mt-1 font-medium">Manage and monitor club members.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#171717] border border-[#262626] rounded-2xl px-4 py-2 focus-within:border-blue-500 transition-colors">
          <svg className="text-[#A3A3A3]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            placeholder="Search members..." 
            className="bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 text-sm w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-[#0A0A0A] border border-[#262626] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262626] bg-[#0A0A0A]">
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em]">Nickname</th>
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-6 text-[#EDEDED] text-[10px] font-black uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-[#A3A3A3] animate-pulse">Loading members...</td>
                </tr>
              ) : filteredUsers?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-[#A3A3A3]">No members found matching your search.</td>
                </tr>
              ) : filteredUsers?.map((user: UserProfile) => (
                <tr key={user.id} className="group hover:bg-[#171717] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#171717] flex items-center justify-center text-[#A3A3A3] font-bold border border-[#262626]">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-bold group-hover:text-blue-400 transition-colors">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[#A3A3A3] font-medium">{user.email}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                      user.role === 'ADMIN' 
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
                        : 'bg-[#171717] text-[#A3A3A3] border-[#262626]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/admin/members/${user.id}`}
                        className="p-2 rounded-lg hover:bg-[#262626] text-[#A3A3A3] hover:text-white transition-colors border border-transparent hover:border-[#3F3F46]"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </Link>
                      <button 
                        onClick={() => handleDelete(user.id, user.name)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
