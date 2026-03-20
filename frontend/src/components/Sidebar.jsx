import React, { useState } from 'react';
import { LayoutDashboard, Users, Calendar, BarChart3, Settings, 
  ClipboardList, UserCircle, LogOut, ChevronLeft, ChevronRight,
  ShieldCheck, UserPlus, FileText, CheckSquare
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { id: 'dash', icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { id: 'users', icon: Users, label: 'User Management', path: '/admin/users' },
      { id: 'leave', icon: Calendar, label: 'Leave Requests', path: '/admin/leave' },
      { id: 'reports', icon: BarChart3, label: 'Reports', path: '/admin/reports' },
      { id: 'settings', icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
    employee: [
      { id: 'dash', icon: LayoutDashboard, label: 'My Dashboard', path: '/employee/dashboard' },
      { id: 'apply', icon: FileText, label: 'Apply Leave', path: '/employee/apply' },
      { id: 'status', icon: ClipboardList, label: 'Leave Status', path: '/employee/status' },
      { id: 'history', icon: Calendar, label: 'Leave History', path: '/employee/history' },
      { id: 'profile', icon: UserCircle, label: 'My Profile', path: '/employee/profile' },
    ],
    manager: [
      { id: 'dash', icon: LayoutDashboard, label: 'Team Dashboard', path: '/manager/dashboard' },
      { id: 'approvals', icon: CheckSquare, label: 'Team Approvals', path: '/manager/approvals' },
      { id: 'reports', icon: BarChart3, label: 'Team Reports', path: '/manager/reports' },
    ],
    hr: [
      { id: 'dash', icon: LayoutDashboard, label: 'HR Dashboard', path: '/hr/dashboard' },
      { id: 'employees', icon: UserPlus, label: 'Employee Mgmt', path: '/hr/employees' },
      { id: 'policy', icon: ShieldCheck, label: 'Leave Policy', path: '/hr/policy' },
      { id: 'approvals', icon: CheckSquare, label: 'Final Approvals', path: '/hr/approvals' },
    ]
  };

  const currentRoleItems = menuItems[user?.role] || [];

  return (
    <motion.div 
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col relative z-50 transition-all duration-300"
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
          >
            LMS Premium
          </motion.h1>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
        {currentRoleItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
              ${isActive ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
            `}
          >
            <item.icon size={22} className="min-w-[22px]" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-primary-500/30" />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-accent/10 hover:text-accent transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={22} className="min-w-[22px]" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
