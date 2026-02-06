import React, { useState } from 'react';
import { useAuth } from '../app/auth/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await (await import('../api/client')).apiClient.post('/auth/login', { email, password });
      await login(response.data.access_token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <div className="w-full max-w-md p-8 relative z-10">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-white mb-2">
            DEGURURU<span className="text-blue-500">.</span>
          </h1>
          <p className="text-zinc-500 font-medium">Bowling Club Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 text-white px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/20"
          >
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-zinc-600 text-sm">
          Forgot your credentials? Contact the administrator.
        </p>
      </div>

      {/* Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
    </div>
  );
};

export default LoginPage;
