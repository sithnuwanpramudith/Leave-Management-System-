import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Trash2, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leaveAPI } from '../../services/api';

const statusStyle = {
  PENDING: { c: 'bg-amber-500/10 text-amber-400', label: 'Pending', icon: Clock },
  MANAGER_APPROVED: { c: 'bg-blue-500/10 text-blue-400', label: 'Mgr Approved', icon: CheckCircle },
  MANAGER_REJECTED: { c: 'bg-red-500/10 text-red-400', label: 'Mgr Rejected', icon: XCircle },
  HR_APPROVED: { c: 'bg-emerald-500/10 text-emerald-400', label: 'Approved', icon: CheckCircle },
  HR_REJECTED: { c: 'bg-red-500/10 text-red-400', label: 'Rejected', icon: XCircle },
};

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelId, setCancelId] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveAPI.getAll();
      setLeaves(data);
    } catch {
      setError('Failed to load leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleCancel = async (id) => {
    try {
      await leaveAPI.cancel(id);
      setCancelId(null);
      fetchLeaves();
    } catch (e) {
      setError(e.error || 'Could not cancel leave request.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Leave History</h1>
        <p className="text-slate-400">All your past and current leave requests.</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} /> {error} <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {loading
        ? <div className="flex items-center justify-center h-48 text-slate-400"><Loader size={28} className="animate-spin" /></div>
        : leaves.length === 0
          ? (
            <div className="glass-card p-12 text-center">
              <FileText size={48} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Leave Requests</h3>
              <p className="text-slate-400">You haven't applied for any leave yet.</p>
            </div>
          )
          : (
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Start</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">End</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Days</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Comments</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {leaves.map(leave => {
                      const st = statusStyle[leave.status] || statusStyle.PENDING;
                      const Icon = st.icon;
                      return (
                        <motion.tr
                          key={leave.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-white/5 group"
                        >
                          <td className="px-6 py-4 font-semibold text-sm">{leave.leave_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{leave.start_date}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{leave.end_date}</td>
                          <td className="px-6 py-4 font-bold">{leave.total_days}d</td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase w-fit ${st.c}`}>
                              <Icon size={11} /> {st.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px]">
                            {leave.manager_comments || leave.hr_comments || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {leave.status === 'PENDING' && (
                              <button
                                onClick={() => setCancelId(leave)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )
      }

      {/* Cancel Confirm Modal */}
      <AnimatePresence>
        {cancelId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-sm p-8 text-center">
              <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Cancel Leave Request?</h3>
              <p className="text-slate-400 text-sm mb-6">This will remove your pending leave request for <strong>{cancelId.leave_type?.name}</strong>.</p>
              <div className="flex gap-3">
                <button onClick={() => setCancelId(null)} className="flex-1 glass-button justify-center">Keep</button>
                <button onClick={() => handleCancel(cancelId.id)} className="flex-1 primary-button justify-center bg-red-600/80 hover:bg-red-600">Cancel Request</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeaveHistory;
