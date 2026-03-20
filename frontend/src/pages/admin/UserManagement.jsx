import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, UserPlus, Shield, Briefcase, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usersAPI } from '../../services/api';

const ROLES = ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE'];
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Sales', 'Marketing', 'Operations', 'Legal', 'Administration'];

const emptyForm = { username: '', email: '', first_name: '', last_name: '', role: 'EMPLOYEE', department: '', phone_number: '', password: '' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (e) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const openCreate = () => {
    setEditUser(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setFormData({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await usersAPI.update(editUser.id, payload);
        showSuccess('User updated successfully.');
      } else {
        await usersAPI.create(formData);
        showSuccess('User created successfully.');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e) {
      setError(e.error || JSON.stringify(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await usersAPI.delete(id);
      setDeleteConfirm(null);
      setSelectedUsers(prev => prev.filter(uid => uid !== id));
      showSuccess('User deleted.');
      fetchUsers();
    } catch (e) {
      setError(e.error || 'Delete failed.');
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filtered.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filtered.map(u => u.id));
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await usersAPI.bulkDelete(selectedUsers);
      showSuccess(`Successfully deleted ${selectedUsers.length} users.`);
      setSelectedUsers([]);
      setBulkDeleteConfirm(false);
      fetchUsers();
    } catch (e) {
      setError(e.error || 'Bulk delete failed.');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filtered = users.filter(u =>
    (u.username + u.email + (u.first_name || '') + (u.last_name || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColor = (role) => {
    const map = { ADMIN: 'text-indigo-400 bg-indigo-500/10', MANAGER: 'text-amber-400 bg-amber-500/10', HR: 'text-emerald-400 bg-emerald-500/10', EMPLOYEE: 'text-primary-400 bg-primary-500/10' };
    return map[role] || 'text-slate-400 bg-white/5';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-slate-400">Add, edit, and manage system users.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {selectedUsers.length > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setBulkDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Selected ({selectedUsers.length})
              </motion.button>
            )}
          </AnimatePresence>
          <button onClick={openCreate} className="primary-button"><UserPlus size={20} /> Add New User</button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
          <CheckCircle size={18} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex-1 max-w-md focus-within:border-primary-500/50 transition-all">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="bg-transparent border-none outline-none text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} users</span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                    checked={filtered.length > 0 && selectedUsers.length === filtered.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-white/10 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                      <td className="px-6 py-4" />
                    </tr>
                  ))
                : (
                  <AnimatePresence>
                    {filtered.map(user => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-white/5 transition-colors group ${selectedUsers.includes(user.id) ? 'bg-primary-500/5' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            className="rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleSelectUser(user.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-slate-300">
                              {(user.full_name || user.username)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{user.full_name || user.username}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${roleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-400 flex items-center gap-1.5">
                            <Briefcase size={13} /> {user.department || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(user)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-primary-400 transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirm(user)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">{editUser ? 'Edit User' : 'Add New User'}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">First Name</label>
                    <input type="text" className="input-field" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Last Name</label>
                    <input type="text" className="input-field" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Username <span className="text-red-400">*</span></label>
                  <input type="text" required className="input-field" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Email</label>
                  <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Phone</label>
                  <input type="text" className="input-field" value={formData.phone_number || ''} onChange={e => setFormData({ ...formData, phone_number: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Role</label>
                    <select className="input-field" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Department</label>
                    <select className="input-field" value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                      <option value="">-- Select --</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                    Password {editUser && <span className="text-slate-500 normal-case font-normal">(leave blank to keep unchanged)</span>}
                    {!editUser && <span className="text-red-400">*</span>}
                  </label>
                  <input type="password" className="input-field" required={!editUser} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 glass-button justify-center">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 primary-button justify-center">
                    {saving ? <Loader size={16} className="animate-spin" /> : (editUser ? 'Update User' : 'Create User')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-sm p-8 text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Delete User?</h3>
              <p className="text-slate-400 text-sm mb-6">This will permanently delete <strong>{deleteConfirm.username}</strong>. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 glass-button justify-center">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 primary-button justify-center bg-red-600 hover:bg-red-500">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Bulk Delete Confirm Modal */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm bg-black/50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-card w-full max-w-sm p-8 text-center">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Bulk Delete?</h3>
              <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete <strong>{selectedUsers.length}</strong> selected users? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setBulkDeleteConfirm(false)} className="flex-1 glass-button justify-center">Cancel</button>
                <button onClick={handleBulkDelete} disabled={isBulkDeleting} className="flex-1 primary-button justify-center bg-red-600 hover:bg-red-500">
                  {isBulkDeleting ? <Loader size={16} className="animate-spin" /> : 'Delete All'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
