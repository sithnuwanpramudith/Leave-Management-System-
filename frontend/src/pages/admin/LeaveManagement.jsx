import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Search, AlertCircle, Filter, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leaveAPI } from '../../services/api';

const statusConfig = {
  PENDING: { label: 'Pending', color: 'bg-amber-500/10 text-amber-400' },
  MANAGER_APPROVED: { label: 'Mgr Approved', color: 'bg-blue-500/10 text-blue-400' },
  MANAGER_REJECTED: { label: 'Mgr Rejected', color: 'bg-red-500/10 text-red-400' },
  HR_APPROVED: { label: 'HR Approved', color: 'bg-emerald-500/10 text-emerald-400' },
  HR_REJECTED: { label: 'HR Rejected', color: 'bg-red-500/10 text-red-400' },
};

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionModal, setActionModal] = useState(null); // { leave, type: 'manager'|'hr' }
  const [comments, setComments] = useState('');
  const [acting, setActing] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveAPI.adminGetAll(statusFilter || null);
      setLeaves(data);
    } catch {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [statusFilter]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAction = async (action) => {
    if (!actionModal) return;
    setActing(true);
    try {
      const { leave, type } = actionModal;
      if (type === 'manager') {
        await leaveAPI.managerAction(leave.id, action, comments);
      } else {
        await leaveAPI.hrAction(leave.id, action, comments);
      }
      showSuccess(`Leave request ${action}d successfully.`);
      setActionModal(null);
      setComments('');
      fetchLeaves();
    } catch (e) {
      setError(e.error || 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  const filtered = leaves.filter(l =>
    (l.user?.username + l.user?.full_name + l.leave_type?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-slate-400">Review and manage all leave requests.</p>
        </div>
        <button onClick={fetchLeaves} className="glass-button"><Loader size={16} /> Refresh</button>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <CheckCircle size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={18} /> {error} <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex-1 max-w-sm focus-within:border-primary-500/50 transition-all">
          <Search size={16} className="text-slate-500" />
          <input type="text" placeholder="Search by employee..." className="bg-transparent border-none outline-none text-sm w-full" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field max-w-[180px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Employee</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Leave Type</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Dates</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Days</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading
              ? Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array(6).fill(0).map((__, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 w-full bg-white/10 rounded" /></td>
                    ))}
                  </tr>
                ))
              : filtered.map(leave => (
                  <tr key={leave.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm">{leave.user?.full_name || leave.user?.username}</p>
                      <p className="text-xs text-slate-500">{leave.user?.department}</p>
                    </td>
                    <td className="px-6 py-4 text-sm">{leave.leave_type?.name}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{leave.start_date} → {leave.end_date}</td>
                    <td className="px-6 py-4 font-bold">{leave.total_days}d</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusConfig[leave.status]?.color}`}>
                        {statusConfig[leave.status]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {leave.status === 'PENDING' && (
                          <button
                            onClick={() => setActionModal({ leave, type: 'manager' })}
                            className="px-3 py-1 text-xs font-bold bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition"
                          >
                            Review
                          </button>
                        )}
                        {leave.status === 'MANAGER_APPROVED' && (
                          <button
                            onClick={() => setActionModal({ leave, type: 'hr' })}
                            className="px-3 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition"
                          >
                            Final Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
            }
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No leave requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-md p-8">
              <h3 className="text-xl font-bold mb-2">Review Leave Request</h3>
              <p className="text-slate-400 text-sm mb-6">
                <strong>{actionModal.leave.user?.full_name}</strong> — {actionModal.leave.leave_type?.name} ({actionModal.leave.total_days} days)<br />
                <span className="text-xs">{actionModal.leave.start_date} to {actionModal.leave.end_date}</span>
              </p>
              <p className="text-sm text-slate-400 mb-2"><strong>Reason:</strong> {actionModal.leave.reason}</p>
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase">Comments (optional)</label>
                <textarea rows={3} className="input-field resize-none" placeholder="Add comments..." value={comments} onChange={e => setComments(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setActionModal(null); setComments(''); }} className="flex-1 glass-button justify-center">Cancel</button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={acting}
                  className="flex-1 primary-button justify-center bg-red-600/80 hover:bg-red-600"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={acting}
                  className="flex-1 primary-button justify-center bg-emerald-600/80 hover:bg-emerald-600"
                >
                  <CheckCircle size={16} /> Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveManagement;
