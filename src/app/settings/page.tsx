'use client';

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { UserProfile, UserRole } from '@/types';
import { fetchUsers, updateUserRoleRecord } from '@/lib/firebase/firestore';
import { formatDateTime, formatDate, formatINR } from '@/lib/formatters';
import {
  Church,
  Users,
  ShieldCheck,
  History,
  Check,
  Save,
  AlertCircle,
  Lock,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, auditLogs, clearAllData } = useTransactions();
  const { user, isAdmin } = useAuth();

  // Settings State
  const [churchName, setChurchName] = useState(settings?.churchName || '');
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);

  // User Management State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'church' | 'users' | 'audit'>('church');

  useEffect(() => {
    if (settings?.churchName) {
      setChurchName(settings.churchName);
    }
    fetchUsers().then(setUsersList);
  }, [settings]);

  const handleSaveChurchInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    await updateSettings({ churchName });
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 3000);
  };

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    if (!isAdmin) return;
    const updated = await updateUserRoleRecord(targetUserId, newRole, {
      name: user?.name || 'Admin',
    });
    setUsersList(updated);
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-6 animate-page-enter">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Settings & Organization
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-xl border ${
              isAdmin 
                ? 'bg-primary-50 text-primary-800 border-primary-200/60'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {isAdmin ? 'Admin Console' : 'Viewer Mode'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('church')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'church'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Church size={15} className={activeTab === 'church' ? 'text-primary' : 'text-slate-400'} />
            <span>Youth Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <Users size={15} className={activeTab === 'users' ? 'text-primary' : 'text-slate-400'} />
            <span>User Roles ({usersList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            <History size={15} className={activeTab === 'audit' ? 'text-primary' : 'text-slate-400'} />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* 1. Church Profile Tab */}
        {activeTab === 'church' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Context Card */}
            <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/80 text-primary flex items-center justify-center shadow-xs">
                  <Church size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Organization Details</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Configure the legal entity and display name for this youth fund tracker. This name appears on all exported CSV statements, PDF financial certificates, and ledger receipts.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-400 space-y-1.5">
                <p className="font-semibold text-slate-600">Operating Standards:</p>
                <p>• Single currency ledger (INR ₹)</p>
                <p>• Tamper-evident transaction logs</p>
                <p>• Role-based permission controls</p>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-card border border-slate-200/80">
              <form onSubmit={handleSaveChurchInfo} className="space-y-5">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Youth Crew Information</h3>
                  </div>
                  {!isAdmin && (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                      <Lock size={12} /> View only
                    </span>
                  )}
                </div>

                {savedSettingsMsg && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <Check size={16} className="text-emerald-600" />
                    <span>Youth settings updated successfully!</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Youth Crew Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isAdmin}
                    value={churchName}
                    onChange={(e) => setChurchName(e.target.value)}
                    placeholder="e.g. Salt And Light Crew"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary focus:bg-white disabled:opacity-60 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <span>Operating Currency</span>
                  </label>
                  <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base shrink-0">
                      ₹
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">Indian Rupee (INR - ₹)</p>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Save size={15} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Clear All Ledger Data Box for Admin */}
              {isAdmin && (
                <div className="mt-8 pt-6 border-t border-rose-100 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                    <ShieldAlert size={18} />
                    <span>Danger Zone: Reset Data</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Permanently clear all local transactions and start with a completely fresh. All existing income and expense rows will be removed.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to clear all transactions and audit logs? This cannot be undone.')) {
                        await clearAllData();
                        alert('Ledger cleared successfully! Current balance is ₹0.');
                      }
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Clear All Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
              <div>
                <h3 className="text-base font-bold text-slate-900">Authorized Personnel Directory</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Role-based permissions for Admins (Full CRUD) and Members (View Only)
                </p>
              </div>
              {!isAdmin && (
                <span className="text-xs text-slate-400 italic">
                  Only Admins can modify role assignments.
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Name & Email</th>
                    <th className="py-3 px-5">Role Badge</th>
                    <th className="py-3 px-5">Permissions Summary</th>
                    <th className="py-3 px-5 text-right">Role Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>

                      <td className="py-4 px-5">
                        <RoleBadge role={u.role} size="md" />
                      </td>

                      <td className="py-4 px-5 text-xs text-slate-600">
                        {u.role === 'admin' ? (
                          <span className="text-primary font-medium">Full CRUD access to add, edit, and delete ledger records</span>
                        ) : (
                          <span className="text-slate-500">Read-Only access to view all balances, reports, and ledger</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {isAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary cursor-pointer"
                          >
                            <option value="admin">Admin (Full CRUD)</option>
                            <option value="user">User (View Only)</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium capitalize bg-slate-100 px-2 py-0.5 rounded">{u.role}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-900">Financial Audit Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every transaction creation, modification, and deletion is recorded for absolute transparency.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                          <History size={18} />
                        </div>
                        <p className="font-semibold text-slate-700 text-xs">No audit events recorded yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Financial actions will automatically log here</p>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isCreate = log.action === 'create';
                      const isUpdate = log.action === 'update';
                      const isDelete = log.action === 'delete';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-mono text-slate-600 text-xs whitespace-nowrap">
                            {formatDateTime(log.createdAt)}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isCreate && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                Created
                              </span>
                            )}
                            {isUpdate && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                                Updated
                              </span>
                            )}
                            {isDelete && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
                                Soft Deleted
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                            {log.performedByName || 'Staff'}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-400 text-xs whitespace-nowrap">
                            {log.transactionId}
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            {log.newData?.category && (
                              <span className="font-medium text-slate-800">
                                {log.newData.category} • {formatINR(log.newData.amount || 0)}
                              </span>
                            )}
                            {log.previousData && log.newData && (
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Changed: {log.previousData.description} → {log.newData.description}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
