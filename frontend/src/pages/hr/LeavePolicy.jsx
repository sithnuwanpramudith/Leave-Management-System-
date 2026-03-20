import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { leaveTypesAPI } from '../../services/api';

const LeavePolicy = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data? }
  const [form, setForm] = useState({ name: '', description: '', default_days: 10 });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const data = await leaveTypesAPI.getAll();
      setTypes(data);
    } catch {
      setError('Failed to load leave types.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTypes(); }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const openCreate = () => {
    setForm({ name: '', description: '', default_days: 10 });
    setModal({ mode: 'create' });
  };

  const openEdit = (t) => {
    setForm({ name: t.name, description: t.description, default_days: t.default_days });
    setModal({ mode: 'edit', data: t });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (modal.mode === 'create') {
        await leaveTypesAPI.create(form);
        showSuccess('Leave type created.');
      } else {
        await leaveTypesAPI.update(modal.data.id, form);
        showSuccess('Leave type updated.');
      }
      setModal(null);
      fetchTypes();
    } catch (e) {
      setError(e.error || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await leaveTypesAPI.delete(id);
      setDeleteConfirm(null);
      showSuccess('Leave type deleted.');
      fetchTypes();
    } catch {
      setError('Delete failed. Leave type may be in use.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Policy</h1>
          <p className="text-slate-400">Manage leave types and their default allowances.</p>
        </div>
        <button onClick={openCreate} className="primary-button"><Plus size={18} /> Add Leave Type</button>
      </div>

      {success && <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"><CheckCircle size={16} /> {success}</div>}
      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error} <button onClick={() => setError(null)} className="ml-auto text-xs underline">Dismiss</button></div>}

      {loading
        ? <div className="flex items-center justify-center h-48"><Loader size={28} className="animate-spin text-slate-400" /></div>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <Shield size={20} className="text-primary-400" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-white/10 transition"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteConfirm(t)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/10 transition"><Trash2 size={15} /></button>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1">{t.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{t.description || 'No description.'}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">Default Allowance</span>
                  <span className="font-bold text-primary-400">{t.default_days} days/year</span>
                </div>
              </motion.div>
            ))}
            {types.length === 0 && <div className="col-span-3 glass-card p-12 text-center text-slate-500">No leave types configured yet.</div>}
          </div>
        )
      }

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-md p-8">
              <h2 className="text-2xl font-bold mb-6">{modal.mode === 'create' ? 'Add Leave Type' : 'Edit Leave Type'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Name <span className="text-red-400">*</span></label>
                  <input required type="text" className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Annual Leave" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Description</label>
                  <textarea rows={3} className="input-field resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Default Days per Year <span className="text-red-400">*</span></label>
                  <input required type="number" min={1} max={365} className="input-field" value={form.default_days} onChange={e => setForm({ ...form, default_days: parseInt(e.target.value) })} />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setModal(null)} className="flex-1 glass-button justify-center">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 primary-button justify-center">
                    {saving ? <Loader size={16} className="animate-spin" /> : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-sm p-8 text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Delete "{deleteConfirm.name}"?</h3>
              <p className="text-slate-400 text-sm mb-6">This may affect existing leave requests.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 glass-button justify-center">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 primary-button justify-center bg-red-600/80 hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeavePolicy;
