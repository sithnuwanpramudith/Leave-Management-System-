import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Shield, Save, Lock, AlertCircle, CheckCircle, Loader, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user: authUser, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pwData, setPwData] = useState({ old_password: '', new_password: '', confirm: '' });
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [changingPw, setChangingPw] = useState(false);

  const showMsg = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await authAPI.getProfile();
        setProfile(data);
        setFormData(data);
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await authAPI.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone_number: formData.phone_number,
      });
      setProfile(updated);
      setUser(prev => ({ ...prev, ...updated }));
      setEditMode(false);
      showMsg(setSuccess, 'Profile updated successfully.');
    } catch {
      setError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError(null);
    if (pwData.new_password !== pwData.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setChangingPw(true);
    try {
      await authAPI.changePassword(pwData.old_password, pwData.new_password);
      setPwData({ old_password: '', new_password: '', confirm: '' });
      showMsg(setPwSuccess, 'Password changed successfully.');
    } catch (e) {
      setPwError(e.error || 'Failed to change password.');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader size={28} className="animate-spin text-slate-400" /></div>;

  const roleColor = { ADMIN: 'text-indigo-400', MANAGER: 'text-amber-400', HR: 'text-emerald-400', EMPLOYEE: 'text-primary-400' };

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      {success && <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm"><CheckCircle size={16} /> {success}</div>}
      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error}</div>}

      {/* Profile Card */}
      <div className="glass-card p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-3xl font-bold">
              {(profile?.full_name || profile?.username || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.full_name || profile?.username}</h2>
              <p className={`text-sm font-bold uppercase tracking-widest ${roleColor[profile?.role] || 'text-slate-400'}`}>{profile?.role}</p>
              <p className="text-xs text-slate-500 mt-1">{profile?.department || 'No department'}</p>
            </div>
          </div>
          <button onClick={() => setEditMode(!editMode)} className="glass-button">
            <Edit3 size={16} /> {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'First Name', key: 'first_name', icon: User },
              { label: 'Last Name', key: 'last_name', icon: User },
              { label: 'Email', key: 'email', icon: Mail, type: 'email' },
              { label: 'Phone', key: 'phone_number', icon: Phone },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><f.icon size={12} />{f.label}</label>
                <input
                  type={f.type || 'text'}
                  className="input-field"
                  value={formData[f.key] || ''}
                  onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                  disabled={!editMode}
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><Shield size={12} />Role</label>
              <input type="text" className="input-field opacity-60" value={profile?.role || ''} disabled />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 flex items-center gap-1.5"><Briefcase size={12} />Department</label>
              <input type="text" className="input-field opacity-60" value={profile?.department || ''} disabled />
            </div>
          </div>

          {editMode && (
            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={saving} className="primary-button">
                {saving ? <Loader size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Lock size={20} className="text-primary-400" /> Change Password</h3>
        {pwSuccess && <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm mb-4"><CheckCircle size={16} /> {pwSuccess}</div>}
        {pwError && <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4"><AlertCircle size={16} /> {pwError}</div>}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Current Password</label>
            <input type="password" required className="input-field" value={pwData.old_password} onChange={e => setPwData({ ...pwData, old_password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">New Password</label>
              <input type="password" required className="input-field" value={pwData.new_password} onChange={e => setPwData({ ...pwData, new_password: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">Confirm Password</label>
              <input type="password" required className="input-field" value={pwData.confirm} onChange={e => setPwData({ ...pwData, confirm: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={changingPw} className="primary-button">
              {changingPw ? <Loader size={16} className="animate-spin" /> : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
