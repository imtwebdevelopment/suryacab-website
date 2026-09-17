import React, { useState, useEffect } from 'react';
import api from '../api';
import { IndianRupee, FileText, CheckCircle2, BarChart3, Activity, ArrowRight, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/invoices');
        const invoices = res.data;
        let rev = 0;
        let pending = 0;
        invoices.forEach(inv => {
          rev += inv.grandTotal || 0;
          if (inv.status === 'Pending') pending++;
        });
        setStats({
          revenue: rev,
          totalInvoices: invoices.length,
          pendingInvoices: pending,
        });
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    { label: 'Total Revenue', value: loading ? '...' : formatINR(stats.revenue), icon: IndianRupee, color: 'from-emerald-400 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', shadow: 'shadow-emerald-500/20' },
    { label: 'Total Invoices', value: loading ? '...' : stats.totalInvoices.toString(), icon: FileText, color: 'from-indigo-400 to-blue-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', shadow: 'shadow-indigo-500/20' },
    { label: 'Completed Invoices', value: loading ? '...' : stats.pendingInvoices.toString(), icon: CheckCircle2, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-600 dark:text-green-400', shadow: 'shadow-green-500/20' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header section with welcome text */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity duration-500 -mr-10 -mt-10 pointer-events-none`} />
              
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-2 uppercase">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.color} shadow-lg ${stat.shadow} transform group-hover:rotate-12 transition-transform duration-500 text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Updated just now</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart / Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-xl transition-all duration-500 delay-300 fill-mode-both">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
         
         <div className="w-full flex justify-between items-center mb-8 relative z-10 border-b border-slate-100 dark:border-slate-700 pb-4">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <BarChart3 className="w-6 h-6 text-indigo-500" />
             Revenue Analytics
           </h3>
           <button className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 group-hover:gap-2 transition-all">
             View Full Report <ArrowRight className="w-4 h-4" />
           </button>
         </div>

         <div className="w-full h-64 flex items-end justify-between gap-2 md:gap-6 relative z-10 px-2 md:px-8">
           {/* Simulated Animated Chart Bars */}
           {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
             <div key={i} className="w-full flex flex-col items-center gap-2 group/bar">
               <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-t-lg relative overflow-hidden flex items-end h-48">
                 <div 
                   className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 rounded-t-lg shadow-lg transform origin-bottom transition-all duration-1000 group-hover/bar:brightness-110" 
                   style={{ height: `${height}%`, animation: `growUp 1.5s ease-out ${i * 100}ms forwards` }}
                 >
                   <div className="absolute inset-0 bg-white/20 dark:bg-white/10 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                 </div>
               </div>
               <span className="text-xs font-medium text-slate-400">Day {i + 1}</span>
             </div>
           ))}
         </div>
      </div>
      
      {/* CSS for custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes growUp {
          from { height: 0%; opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
