import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, ArrowRight, FileText, PieChart, AlertCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { leaveAPI, reportsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const statusStyle = {
  PENDING: 'bg-amber-500/10 text-amber-400',
  MANAGER_APPROVED: 'bg-blue-500/10 text-blue-400',
  MANAGER_REJECTED: 'bg-red-500/10 text-red-400',
  HR_APPROVED: 'bg-emerald-500/10 text-emerald-400',
  HR_REJECTED: 'bg-red-500/10 text-red-400',
};

const statusLabel = {
  PENDING: 'Pending',
  MANAGER_APPROVED: 'Mgr Approved',
  MANAGER_REJECTED: 'Mgr Rejected',
  HR_APPROVED: 'Approved',
  HR_REJECTED: 'Rejected',
};

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [balData, reqData, statsData] = await Promise.all([
          leaveAPI.getBalance(),
          leaveAPI.getAll(),
          reportsAPI.getStats(),
        ]);
        setBalances(balData);
        setRequests(reqData.slice(0, 5));
        setStats(statsData);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['from-primary-600 to-primary-400', 'from-emerald-600 to-emerald-400', 'from-amber-600 to-amber-400'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-slate-400">Welcome back, <strong>{user?.username}</strong>! Track your leave balance and request status.</p>
        </div>
        <button className="primary-button" onClick={() => navigate('/employee/apply')}>Apply New Leave <ArrowRight size={18} /></button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array(3).fill(0).map((_, i) => <div key={i} className="glass-card p-6 animate-pulse h-36" />)
          : balances.length === 0
            ? <div className="col-span-3 glass-card p-6 text-slate-500 text-center">No leave balances found. Contact HR to set up your account.</div>
            : balances.map((bal, i) => (
                <div key={bal.id} className="glass-card p-6 group hover:border-primary-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{bal.leave_type?.name}</span>
                    <PieChart className="text-primary-400" size={20} />
                  </div>
                  <div className="flex items-end gap-2">
                    <h2 className="text-4xl font-bold">{bal.remaining_days}</h2>
                    <span className="text-slate-500 font-medium mb-1">/ {bal.total_days} Days Left</span>
                  </div>
                  <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bal.total_days > 0 ? (bal.remaining_days / bal.total_days) * 100 : 0}%` }}
                      className={`h-full bg-gradient-to-r ${COLORS[i % COLORS.length]}`}
                    />
                  </div>
                </div>
              ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-6">Recent Requests</h3>
            {loading
              ? <div className="flex items-center justify-center h-24 text-slate-500"><Loader size={24} className="animate-spin" /></div>
              : requests.length === 0
                ? <p className="text-slate-500 text-sm text-center py-8">No leave requests yet. <button className="text-primary-400 underline" onClick={() => navigate('/employee/apply')}>Apply for leave</button></p>
                : (
                  <div className="space-y-3">
                    {requests.map((req, i) => (
                      <div key={req.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${req.status === 'HR_APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : req.status?.includes('REJECTED') ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{req.leave_type?.name}</p>
                            <p className="text-xs text-slate-500">{req.total_days} Days • {req.start_date}</p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusStyle[req.status]}`}>
                          {statusLabel[req.status]}
                        </span>
                      </div>
                    ))}
                  </div>
                )
            }
            <button className="w-full mt-6 py-2 text-primary-400 hover:text-primary-300 text-sm font-bold transition-colors" onClick={() => navigate('/employee/history')}>
              View All History →
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-primary-600/20 to-transparent">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock size={20} className="text-primary-400" /> My Stats</h3>
            <div className="space-y-4">
              {stats && [
                { label: 'Total Requests', value: stats.total_requests, icon: FileText },
                { label: 'Pending', value: stats.pending, icon: Clock },
                { label: 'Approved', value: stats.approved, icon: CheckCircle },
                { label: 'Rejected', value: stats.rejected, icon: XCircle },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <s.icon size={15} />
                    {s.label}
                  </div>
                  <span className="font-bold">{s.value ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
