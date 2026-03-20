import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Lock, Globe, Clock, Plus, Trash2 } from 'lucide-react';

const Settings = () => {
  const [leaveTypes, setLeaveTypes] = useState([
    { id: 1, name: 'Annual Leave', days: 20 },
    { id: 2, name: 'Sick Leave', days: 10 },
    { id: 3, name: 'Casual Leave', days: 7 },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-slate-400">Configure global leave policies and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-primary-400" size={20} /> Leave Policy Settings
              </h3>
              <button className="primary-button py-1 text-xs"><Plus size={14} /> Add Leave Type</button>
            </div>
            <div className="space-y-4">
              {leaveTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div>
                    <p className="font-bold">{type.name}</p>
                    <p className="text-xs text-slate-500">Maximum {type.days} days per year</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Max Allowance</p>
                      <input 
                        type="number" 
                        defaultValue={type.days}
                        className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center font-bold outline-none focus:border-primary-500"
                      />
                    </div>
                    <button className="p-2 text-slate-500 hover:text-accent transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Shield className="text-primary-400" size={20} /> Security & Permissions
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Require 2FA for all administrative accounts.</p>
                </div>
                <div className="w-12 h-6 bg-primary-600 rounded-full p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm"></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">Auto-Approve Manager Requests</p>
                  <p className="text-xs text-slate-500">Bypass HR approval for manager-level leave requests.</p>
                </div>
                <div className="w-12 h-6 bg-slate-800 rounded-full p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-slate-500 rounded-full mr-auto shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: 'Notification Settings', icon: Bell },
                { label: 'Global Localization', icon: Globe },
                { label: 'Data Export / Import', icon: Download },
                { label: 'User Roles Audit', icon: Shield },
              ].map((link, i) => (
                <button key={i} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all text-sm text-slate-400 hover:text-white">
                  <link.icon size={18} />
                  <span>{link.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Import for icons
import { Download } from 'lucide-react';

export default Settings;
