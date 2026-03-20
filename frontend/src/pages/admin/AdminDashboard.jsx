import React, { useState, useEffect } from 'react';
import { Shield, Users, Calendar, BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsAPI.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statCards = stats ? [
    { label: 'Total Employees', value: stats.total_employees, icon: Users, color: 'text-primary-400', sub: `${stats.total_users} total users` },
    { label: 'Leave Requests', value: stats.total_leave_requests, icon: Calendar, color: 'text-amber-400', sub: `${stats.pending_leaves} pending` },
    { label: 'Approved Today', value: stats.approved_today, icon: CheckCircle, color: 'text-emerald-400', sub: 'Since midnight' },
    { label: 'Active Policies', value: stats.active_policies, icon: Shield, color: 'text-indigo-400', sub: 'Leave types' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-400">Live system overview.</p>
        </div>
        <div className="flex gap-3">
          <button className="glass-button" onClick={fetchStats}><RefreshCw size={16} /> Refresh</button>
          <button className="primary-button" onClick={() => navigate('/admin/users')}>Manage Users</button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="stat-card animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-10 w-16 bg-white/10 rounded" />
              </div>
            ))
          : statCards.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="stat-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                  <s.icon size={18} className={s.color} />
                </div>
                <h2 className="text-4xl font-bold mt-1">{s.value ?? '—'}</h2>
                <p className="text-xs text-slate-500 mt-3">{s.sub}</p>
              </motion.div>
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2 glass-card p-8">
          <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Add New User', icon: Users, color: 'bg-primary-500/10 text-primary-400', path: '/admin/users' },
              { label: 'Review Leave Requests', icon: Calendar, color: 'bg-amber-500/10 text-amber-400', path: '/admin/leave' },
              { label: 'View Reports', icon: BarChart3, color: 'bg-emerald-500/10 text-emerald-400', path: '/admin/reports' },
              { label: 'Leave Policies', icon: Shield, color: 'bg-indigo-500/10 text-indigo-400', path: '/admin/settings' },
            ].map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(a.path)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                  <a.icon size={20} />
                </div>
                <span className="font-semibold text-sm">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400 mb-4">Leave Summary</h3>
            <div className="space-y-3">
              {stats && [
                { label: 'Pending Review', value: stats.pending_leaves, color: 'text-amber-400' },
                { label: 'Approved Today', value: stats.approved_today, color: 'text-emerald-400' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{item.label}</span>
                  <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6 bg-gradient-to-br from-primary-600/10 to-transparent">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400 mb-2">System Status</h3>
            <div className="flex items-center gap-3 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-medium">All nodes operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
