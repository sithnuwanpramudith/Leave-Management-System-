import React, { useState, useEffect } from 'react';
import { PieChart, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { leaveAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LeaveBalance = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTeam = async () => {
      try {
        const all = await usersAPI.getAll();
        const team = all.filter(u => u.department === user?.department && u.role === 'EMPLOYEE');
        setTeamMembers(team);
      } catch {
        setError('Failed to load team members.');
      } finally {
        setLoading(false);
      }
    };
    loadTeam();
  }, []);

  const loadBalance = async (userId) => {
    setSelectedUser(userId);
    setLoadingBalance(true);
    try {
      const data = await leaveAPI.getBalance(userId);
      setBalances(data);
    } catch {
      setError('Failed to load balance.');
    } finally {
      setLoadingBalance(false);
    }
  };

  const COLORS = ['from-primary-600 to-primary-400', 'from-emerald-600 to-emerald-400', 'from-amber-600 to-amber-400', 'from-indigo-600 to-indigo-400'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Balances</h1>
          <p className="text-slate-400">View leave balances for your team members.</p>
        </div>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team member list */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Team Members</h3>
          {loading
            ? <div className="flex items-center justify-center h-24"><Loader size={20} className="animate-spin text-slate-400" /></div>
            : teamMembers.length === 0
              ? <p className="text-slate-500 text-sm">No team members found.</p>
              : (
                <div className="space-y-2">
                  {teamMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => loadBalance(m.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedUser === m.id ? 'bg-primary-500/20 border border-primary-500/30' : 'hover:bg-white/5'}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm">
                        {(m.full_name || m.username)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{m.full_name || m.username}</p>
                        <p className="text-xs text-slate-500">{m.department}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )
          }
        </div>

        {/* Balance display */}
        <div className="lg:col-span-2">
          {!selectedUser
            ? (
              <div className="glass-card p-12 text-center h-full flex flex-col items-center justify-center">
                <PieChart size={48} className="text-slate-600 mb-4" />
                <p className="text-slate-500">Select a team member to view their leave balance.</p>
              </div>
            )
            : loadingBalance
              ? <div className="flex items-center justify-center h-48"><Loader size={28} className="animate-spin text-slate-400" /></div>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {balances.map((b, i) => (
                    <motion.div key={b.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{b.leave_type?.name}</span>
                        <PieChart size={18} className="text-primary-400" />
                      </div>
                      <div className="flex items-end gap-2">
                        <h2 className="text-4xl font-bold">{b.remaining_days}</h2>
                        <span className="text-slate-500 mb-1">/ {b.total_days} remaining</span>
                      </div>
                      <div className="mt-4 h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${b.total_days > 0 ? (b.remaining_days / b.total_days) * 100 : 0}%` }}
                          className={`h-full bg-gradient-to-r ${COLORS[i % COLORS.length]} rounded-full`}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-3">{b.used_days} days used</p>
                    </motion.div>
                  ))}
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
