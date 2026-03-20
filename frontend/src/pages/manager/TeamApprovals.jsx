import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, MessageSquare, Loader, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leaveAPI } from '../../services/api';

const TeamApprovals = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [comments, setComments] = useState('');
  const [acting, setActing] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveAPI.getAll('PENDING');
      setLeaves(data);
    } catch {
      setError('Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleAction = async (action) => {
    setActing(true);
    try {
      await leaveAPI.managerAction(actionModal.id, action, comments);
      showSuccess(`Leave request ${action}d.`);
      setActionModal(null);
      setComments('');
      fetchLeaves();
    } catch (e) {
      setError(e.error || 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Approvals</h1>
          <p className="text-slate-400">Review and action pending leave requests from your team.</p>
        </div>
        <button onClick={fetchLeaves} className="glass-button"><RefreshCw size={16} /> Refresh</button>
      </div>

      {success && <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"><CheckCircle size={16} /> {success}</div>}
      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error} <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button></div>}

      {loading
        ? <div className="flex items-center justify-center h-48"><Loader size={28} className="animate-spin text-slate-400" /></div>
        : leaves.length === 0
          ? (
            <div className="glass-card p-12 text-center">
              <CheckCircle size={48} className="text-emerald-500/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
              <p className="text-slate-400">No pending leave requests from your team.</p>
            </div>
          )
          : (
            <div className="space-y-4">
              {leaves.map(leave => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
                      {(leave.user?.full_name || leave.user?.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold">{leave.user?.full_name || leave.user?.username}</p>
                      <p className="text-xs text-slate-500">{leave.user?.department} • {leave.leave_type?.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{leave.start_date} → {leave.end_date} ({leave.total_days}d)</p>
                    </div>
                  </div>
                  <div className="flex-1 mx-4">
                    <p className="text-sm text-slate-400 italic">"{leave.reason}"</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setActionModal(leave); setComments(''); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition"
                    >
                      <MessageSquare size={15} /> Review
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )
      }

      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-md p-8">
              <h3 className="text-xl font-bold mb-2">Review Leave Request</h3>
              <div className="p-3 bg-white/5 rounded-xl mb-4 text-sm space-y-1">
                <p><span className="text-slate-500">Employee:</span> <strong>{actionModal.user?.full_name || actionModal.user?.username}</strong></p>
                <p><span className="text-slate-500">Type:</span> {actionModal.leave_type?.name} ({actionModal.total_days} days)</p>
                <p><span className="text-slate-500">Period:</span> {actionModal.start_date} to {actionModal.end_date}</p>
                <p><span className="text-slate-500">Reason:</span> {actionModal.reason}</p>
              </div>
              <div className="space-y-2 mb-6">
                <label className="text-xs font-bold text-slate-400 uppercase">Comments (optional)</label>
                <textarea rows={3} className="input-field resize-none" placeholder="Add comments for the employee..." value={comments} onChange={e => setComments(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setActionModal(null)} className="flex-1 glass-button justify-center">Cancel</button>
                <button onClick={() => handleAction('reject')} disabled={acting} className="flex-1 primary-button justify-center bg-red-600/80 hover:bg-red-600">
                  <XCircle size={16} /> Reject
                </button>
                <button onClick={() => handleAction('approve')} disabled={acting} className="flex-1 primary-button justify-center bg-emerald-600/80 hover:bg-emerald-600">
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

export default TeamApprovals;
