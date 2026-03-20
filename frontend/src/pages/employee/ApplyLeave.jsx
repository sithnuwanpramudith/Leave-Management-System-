import React, { useState, useEffect } from 'react';
import { Send, Calendar, MessageCircle, AlertCircle, Info, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { leaveAPI, leaveTypesAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [formData, setFormData] = useState({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [types, bal] = await Promise.all([leaveTypesAPI.getAll(), leaveAPI.getBalance()]);
        setLeaveTypes(types);
        setBalances(bal);
        if (types.length > 0) setFormData(f => ({ ...f, leave_type_id: types[0].id }));
      } catch {
        setError('Failed to load leave types.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedBalance = balances.find(b => b.leave_type?.id === parseInt(formData.leave_type_id));

  const totalDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const diff = new Date(formData.end_date) - new Date(formData.start_date);
    return Math.max(Math.round(diff / (1000 * 60 * 60 * 24)) + 1, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date cannot be before start date.');
      return;
    }
    setSubmitting(true);
    try {
      await leaveAPI.apply(formData);
      setSuccess(true);
      setTimeout(() => navigate('/employee/history'), 1500);
    } catch (err) {
      setError(err.error || JSON.stringify(err) || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400"><Loader size={32} className="animate-spin" /></div>;

  if (success) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
        <CheckCircle size={32} className="text-emerald-400" />
      </motion.div>
      <h2 className="text-2xl font-bold">Request Submitted!</h2>
      <p className="text-slate-400">Redirecting to leave history...</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Apply for Leave</h1>
        <p className="text-slate-400">Provide the details for your leave request.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Leave Type</label>
              <select
                required
                className="input-field"
                value={formData.leave_type_id}
                onChange={e => setFormData({ ...formData, leave_type_id: e.target.value })}
              >
                {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> From Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.start_date}
                  onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar size={14} /> To Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.end_date}
                  onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            {totalDays() > 0 && (
              <div className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 text-sm font-medium">
                Duration: <strong>{totalDays()} day{totalDays() > 1 ? 's' : ''}</strong>
                {selectedBalance && ` (${selectedBalance.remaining_days} days remaining)`}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><MessageCircle size={14} /> Reason for Leave</label>
              <textarea
                required
                rows="4"
                className="input-field resize-none"
                placeholder="Briefly explain the reason for your leave..."
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button type="submit" disabled={submitting} className="primary-button w-full justify-center py-4 text-lg">
                {submitting ? <><Loader size={20} className="animate-spin" /> Submitting...</> : <>Submit Request <Send size={20} /></>}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-400"><AlertCircle size={20} /> Important Note</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />Submit requests at least 3 days in advance for annual leave.</li>
              <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />Medical certificate is required for sick leave over 2 days.</li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Info size={20} className="text-primary-400" /> Leave Balance</h3>
            <div className="space-y-3">
              {balances.map(b => (
                <div key={b.id} className="flex justify-between text-sm">
                  <span className="text-slate-500">{b.leave_type?.name}</span>
                  <span className="font-bold">{b.remaining_days} / {b.total_days} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
