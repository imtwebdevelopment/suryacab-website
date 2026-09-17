import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Shield, CheckCircle2, AlertCircle, Save, Camera } from 'lucide-react';
import api from '../api';

export default function Settings() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      setFormData({
        name: res.data.name || '',
        email: res.data.email || '',
        password: '',
        confirmPassword: '',
        profileImage: res.data.profileImage || ''
      });
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        name: formData.name,
        email: formData.email,
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      if (formData.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      const res = await api.put('/auth/profile', updateData);
      
      // Update local storage if needed
      localStorage.setItem('user', JSON.stringify(res.data));
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      setMessage('Profile updated successfully!');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
          Profile Settings
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-500" />
          Manage your account details and security.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-3">Click to upload picture</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          {message && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl border border-red-200 dark:border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Personal Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Security</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
