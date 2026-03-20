import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TeamReports = () => {
  const { user } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsAPI.getTeamReport(user?.department);
      setReport(data);
    } catch {
      setError('Failed to load team report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const maxTotal = Math.max(...report.map(r => r.total), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Reports</h1>
          <p className="text-slate-400">Leave summary for your department: <strong>{user?.department || 'N/A'}</strong></p>
        </div>
        <button onClick={fetchReport} className="glass-button"><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle size={16} /> {error}</div>}

      {loading
        ? <div className="flex items-center justify-center h-48"><Loader size={28} className="animate-spin text-slate-400" /></div>
        : report.length === 0
          ? <div className="glass-card p-12 text-center text-slate-500">No team data found.</div>
          : (
            <>
              <div className="glass-card p-8">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><BarChart3 size={20} className="text-primary-400" /> Leave per Team Member</h3>
                <div className="space-y-4">
                  {report.map((member, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{member.full_name}</span>
                        <span className="text-slate-400">{member.total} total ({member.approved} approved)</span>
                      </div>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(member.total / maxTotal) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Member</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Total</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Pending</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Approved</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {report.map((m, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-6 py-4 font-semibold">{m.full_name}</td>
                        <td className="px-6 py-4 text-right font-bold text-primary-400">{m.total}</td>
                        <td className="px-6 py-4 text-right text-amber-400">{m.pending}</td>
                        <td className="px-6 py-4 text-right text-emerald-400">{m.approved}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )
      }
    </div>
  );
};

export default TeamReports;
