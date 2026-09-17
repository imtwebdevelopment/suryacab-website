import React from 'react';
import { LayoutDashboard, FileSpreadsheet, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Invoices', icon: FileSpreadsheet }
  ];

  return (
    <aside className={`fixed md:relative inset-y-0 left-0 w-64 flex-shrink-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-6 flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/20 hover:rotate-12 transition-transform cursor-pointer">
          A
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">AdminPanel</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                if (setIsOpen) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group animate-in fade-in slide-in-from-left-4 ${
                activeTab === item.name 
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-500/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'both' }}
            >
              <Icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === item.name ? 'scale-110' : 'opacity-70 group-hover:scale-110'}`} />
              {item.name}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300" style={{ animationFillMode: 'both' }}>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors font-medium text-sm group"
        >
          <LogOut className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
          Logout
        </button>
      </div>
    </aside>
  );
}
