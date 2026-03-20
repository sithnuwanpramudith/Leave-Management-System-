import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import LeaveManagement from './pages/admin/LeaveManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import LeaveHistory from './pages/employee/LeaveHistory';
import Profile from './pages/employee/Profile';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import TeamApprovals from './pages/manager/TeamApprovals';
import TeamReports from './pages/manager/TeamReports';
import LeaveBalance from './pages/manager/LeaveBalance';

// HR Pages
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeManagement from './pages/hr/EmployeeManagement';
import LeavePolicy from './pages/hr/LeavePolicy';
import FinalApproval from './pages/hr/FinalApproval';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/login" replace />} />
            
            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/leave" element={<LeaveManagement />} />
            <Route path="admin/reports" element={<Reports />} />
            <Route path="admin/settings" element={<Settings />} />

            {/* Employee Routes */}
            <Route path="employee/dashboard" element={<EmployeeDashboard />} />
            <Route path="employee/apply" element={<ApplyLeave />} />
            <Route path="employee/status" element={<LeaveHistory />} />
            <Route path="employee/history" element={<LeaveHistory />} />
            <Route path="employee/profile" element={<Profile />} />

            {/* Manager Routes */}
            <Route path="manager/dashboard" element={<ManagerDashboard />} />
            <Route path="manager/approvals" element={<TeamApprovals />} />
            <Route path="manager/reports" element={<TeamReports />} />
            <Route path="manager/balance" element={<LeaveBalance />} />

            {/* HR Routes */}
            <Route path="hr/dashboard" element={<HRDashboard />} />
            <Route path="hr/employees" element={<EmployeeManagement />} />
            <Route path="hr/policy" element={<LeavePolicy />} />
            <Route path="hr/approvals" element={<FinalApproval />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
