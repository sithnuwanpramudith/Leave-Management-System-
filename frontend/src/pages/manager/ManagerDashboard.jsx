import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { reportsAPI, leaveAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, leavesData] = await Promise.all([
        reportsAPI.getStats(),
        leaveAPI.getAll(),
      ]);
      setStats(statsData);
      setPendingLeaves(leavesData.slice(0, 5));
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const statCards = stats ? [
    { label: 'Team Members', value: stats.team_count, icon: Users, color: 'text-primary-400' },
    { label: 'Pending Approvals', value: stats.pending_leaves, icon: Clock, color: 'text-amber-400' },
    { label: 'Approved Leaves', value: stats.approved_leaves, icon: CheckCircle, color: 'text-emerald-400' },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-slate-400">Welcome, <strong>{user?.username}</strong>! Manage your team's leave requests.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="glass-button"><RefreshCw size={16} /></button>
          <button onClick={() => navigate('/manager/approvals')} className="primary-button">Review Pending</button>
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array(3).fill(0).map((_, i) => <div key={i} className="stat-card animate-pulse h-32" />)
          : statCards.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
                  <s.icon size={18} className={s.color} />
                </div>
                <h2 className="text-4xl font-bold mt-2">{s.value ?? '—'}</h2>
              </motion.div>
            ))
        }
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6">Pending Team Requests</h3>
        {loading
          ? <div className="h-24 animate-pulse bg-white/5 rounded-xl" />
          : pendingLeaves.length === 0
            ? <p className="text-slate-500 text-center py-6">No pending leave requests.</p>
            : (
              <div className="space-y-3">
                {pendingLeaves.map(l => (
                  <div key={l.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                        {(l.user?.full_name || l.user?.username || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{l.user?.full_name || l.user?.username}</p>
                        <p className="text-xs text-slate-500">{l.leave_type?.name} • {l.total_days} days</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/manager/approvals')}
                      className="px-3 py-1 text-xs font-bold bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            )
        }
        {!loading && pendingLeaves.length > 0 && (
          <button className="w-full mt-4 py-2 text-primary-400 text-sm font-bold hover:text-primary-300" onClick={() => navigate('/manager/approvals')}>
            View All Approvals →
          </button>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
