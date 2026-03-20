import React from 'react';
import { Bell, Search, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="h-20 bg-slate-950/30 backdrop-blur-md border-b border-white/10 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-xl w-96 group focus-within:border-primary-500/50 transition-all">
        <Search size={20} className="text-slate-400 group-focus-within:text-primary-400" />
        <input 
          type="text" 
          placeholder="Search requests, employees..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="p-2.5 hover:bg-white/10 rounded-xl transition-colors relative group">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-slate-950"></span>
            <div className="absolute top-full right-0 mt-2 w-64 glass-card p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <p className="text-xs font-semibold mb-2">Notifications</p>
              <div className="space-y-2">
                <div className="text-[10px] text-white/60 p-2 hover:bg-white/5 rounded-lg">New leave request from Alice</div>
                <div className="text-[10px] text-white/60 p-2 hover:bg-white/5 rounded-lg">HR policy updated</div>
              </div>
            </div>
          </button>
          <button className="p-2.5 hover:bg-white/10 rounded-xl transition-colors">
            <Moon size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-white/10"></div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name}</p>
            <p className="text-[10px] text-primary-400 uppercase tracking-wider font-bold">{user?.role} Portal</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center font-bold text-white border border-white/20 shadow-lg shadow-primary-500/20">
            {user?.name?.[0]}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
