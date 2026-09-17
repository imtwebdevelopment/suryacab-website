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
    <div className="min-h-screen relative flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Split Background */}
      <div className="absolute inset-0 flex flex-col z-0">
        <div className="flex-[3] bg-[#f0eaff] dark:bg-slate-900"></div>
        <div className="flex-[2] bg-white dark:bg-slate-950"></div>
      </div>
      
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo className="w-32 h-auto mb-2 drop-shadow-lg" />
          <div className="mt-3 max-w-[280px] w-full mx-auto bg-[#0055b8] text-white text-[10px] sm:text-[11px] font-bold text-center py-1.5 tracking-[0.15em] rounded-sm shadow-md">
            SURYA CABS AND LOGISTICS
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight mt-6">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Sign in to access your admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="text-red-500 text-sm text-center bg-red-100/50 py-2 rounded-lg">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-indigo-500 bg-slate-100 border-slate-300 focus:ring-indigo-500" />
              <span className="text-slate-600 dark:text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Forgot Password?</a>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 mt-6 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
