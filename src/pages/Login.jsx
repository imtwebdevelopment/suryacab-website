import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api';
import Logo from '../components/Logo';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(email && password) {
      setError('');
      setLoading(true);
      try {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        onLogin();
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#f0eaff] dark:bg-slate-900 selection:bg-indigo-500 selection:text-white">
      
      <div className="w-full max-w-[400px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6 sm:p-7 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-5 flex flex-col items-center">
          <Logo className="w-24 h-auto mb-2 drop-shadow-lg" />
          <div className="mt-2 max-w-[260px] w-full mx-auto bg-[#0055b8] text-white text-[9px] sm:text-[10px] font-bold text-center py-1 tracking-[0.15em] rounded-sm shadow-md">
            SURYA CABS AND LOGISTICS
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight mt-3">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs">Sign in to access your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="text-red-500 text-xs text-center bg-red-100/50 py-1.5 rounded-lg">{error}</div>}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm text-slate-800 dark:text-slate-200"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm text-slate-800 dark:text-slate-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-xs mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded text-indigo-500 bg-slate-100 border-slate-300 focus:ring-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-4 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
