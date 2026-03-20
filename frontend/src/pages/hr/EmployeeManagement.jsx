import React, { useState, useEffect } from 'react';
import { Search, Users, Briefcase, Shield, Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { usersAPI } from '../../services/api';

const EmployeeManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await usersAPI.getAll();
        setUsers(data);
      } catch {
        setError('Failed to load employees.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    (u.full_name + u.username + u.email + u.department || '').toLowerCase().includes(search.toLowerCase()) &&
    (roleFilter ? u.role === roleFilter : true)
  );

  const roleColor = (role) => {
    const m = { ADMIN: 'text-indigo-400 bg-indigo-500/10', MANAGER: 'text-amber-400 bg-amber-500/10', HR: 'text-emerald-400 bg-emerald-500/10', EMPLOYEE: 'text-primary-400 bg-primary-500/10' };
    return m[role] || 'text-slate-400 bg-white/5';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-slate-400">View all employees and their profiles. ({users.length} total)</p>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error}</div>}

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl max-w-sm flex-1 focus-within:border-primary-500/50 transition-all">
          <Search size={16} className="text-slate-500" />
          <input type="text" placeholder="Search employees..." className="bg-transparent outline-none border-none text-sm w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field max-w-[160px]" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          {['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading
        ? <div className="flex items-center justify-center h-48"><Loader size={28} className="animate-spin text-slate-400" /></div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-6 hover:border-primary-500/20 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-bold text-lg">
                    {(u.full_name || u.username)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold">{u.full_name || u.username}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield size={13} className="text-slate-500" />
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${roleColor(u.role)}`}>{u.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Briefcase size={13} />
                    <span>{u.department || 'No department'}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className={`text-xs font-bold ${u.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {u.is_active ? '● Active' : '○ Inactive'}
                  </span>
                  <span className="text-xs text-slate-600">ID: {u.id}</span>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && <div className="col-span-3 text-center text-slate-500 py-12">No employees found.</div>}
          </div>
        )
      }
    </div>
  );
};

export default EmployeeManagement;
