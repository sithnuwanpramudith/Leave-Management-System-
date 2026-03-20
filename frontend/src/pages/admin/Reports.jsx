import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { reportsAPI } from '../../services/api';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportData, statsData] = await Promise.all([
        reportsAPI.getLeaveReport(),
        reportsAPI.getStats(),
      ]);
      setReport(reportData);
      setStats(statsData);
    } catch {
      setError('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const maxMonthly = report ? Math.max(...report.monthly_trend.map(m => m.count), 1) : 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-slate-400">Live leave statistics across the organization.</p>
        </div>
        <button onClick={fetchData} className="glass-button"><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', value: stats?.total_employees, color: 'text-primary-400' },
          { label: 'Total Requests', value: stats?.total_leave_requests, color: 'text-amber-400' },
          { label: 'Pending', value: stats?.pending_leaves, color: 'text-orange-400' },
          { label: 'Active Leave Types', value: stats?.active_policies, color: 'text-emerald-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="stat-card">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</span>
            <h2 className={`text-4xl font-bold mt-2 ${s.color}`}>{loading ? '—' : (s.value ?? 0)}</h2>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><TrendingUp size={20} className="text-primary-400" /> Monthly Leave Trend</h3>
          {loading
            ? <div className="h-48 flex items-center justify-center text-slate-500">Loading...</div>
            : (
              <div>
                <div className="flex items-end justify-between gap-2 h-48">
                  {report?.monthly_trend.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute bottom-full mb-1 text-[10px] bg-slate-800 px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {m.count} requests
                      </div>
                      <div
                        className="w-full bg-gradient-to-t from-primary-700 to-primary-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${Math.max((m.count / maxMonthly) * 100, m.count > 0 ? 8 : 2)}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  {MONTH_NAMES.map(m => <span key={m} className="flex-1 text-center text-[9px] text-slate-500 font-bold">{m}</span>)}
                </div>
              </div>
            )
          }
        </div>

        {/* By Leave Type */}
        <div className="glass-card p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><PieChart size={20} className="text-amber-400" /> Leave by Type</h3>
          {loading
            ? <div className="h-48 flex items-center justify-center text-slate-500">Loading...</div>
            : (
              <div className="space-y-4">
                {report?.by_type.length === 0
                  ? <p className="text-slate-500 text-sm">No data yet.</p>
                  : report?.by_type.map((t, i) => {
                      const pct = report.by_type.reduce((s, x) => s + x.total, 0);
                      const percent = pct > 0 ? Math.round((t.total / pct) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{t.leave_type__name || 'Unknown'}</span>
                            <span className="text-slate-400">{t.total} ({percent}%)</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })
                }
              </div>
            )
          }
        </div>
      </div>

      {/* By Department */}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-emerald-400" /> Leave by Department</h3>
        {loading
          ? <div className="text-slate-500 text-sm">Loading...</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase">Department</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Total Requests</th>
                    <th className="pb-4 text-xs font-bold text-slate-400 uppercase text-right">Approved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {report?.by_department.length === 0
                    ? <tr><td colSpan={3} className="py-8 text-center text-slate-500">No data yet.</td></tr>
                    : report?.by_department.map((d, i) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="py-4 font-medium">{d.user__department || 'Unknown'}</td>
                          <td className="py-4 text-right font-bold text-amber-400">{d.total}</td>
                          <td className="py-4 text-right font-bold text-emerald-400">{d.approved}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default Reports;
