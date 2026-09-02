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
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Settings & User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage youth crew details, financial access roles, and audit trail
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('church')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'church'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Church size={16} />
            <span>Youth Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={16} />
            <span>User Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'audit'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History size={16} />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* 1. Church Profile Tab */}
        {activeTab === 'church' && (
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 max-w-2xl">
            <form onSubmit={handleSaveChurchInfo} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-800">Youth Crew Information</h3>
                {!isAdmin && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                    <Lock size={12} /> Admin only
                  </span>
                )}
              </div>

              {savedSettingsMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check size={16} /> Youth settings updated successfully!
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Youth Crew Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  placeholder="e.g. Salt And Light Crew"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 focus:bg-white disabled:opacity-60 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <span>Operating Currency</span>
                  <span className="text-slate-400 font-normal">(System Locked)</span>
                </label>
                <div className="flex items-center gap-3 p-3 bg-slate-100/70 border border-slate-200 rounded-xl text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    ₹
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Indian Rupee (INR - ₹)</p>
                    <p className="text-xs text-slate-500">
                      Standard Indian numbering format (Lakhs & Crores) is strictly enabled across all ledgers.
                    </p>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
                  >
                    <Save size={16} />
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
                  <span>Ledger Data Management</span>
                </div>
                <p className="text-xs text-slate-500">
                  Permanently clear all local transactions and start with a completely fresh, empty ledger.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to clear all transactions and audit logs? This cannot be undone.')) {
                      await clearAllData();
                      alert('Ledger cleared successfully! Current balance is ₹0.');
                    }
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition"
                >
                  Clear All Transaction Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Authorized Personnel</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Role-based permissions for Admins, Treasurers, and Viewers
                </p>
              </div>
              {!isAdmin && (
                <span className="text-xs text-slate-500 italic">
                  Only Admins can modify role assignments.
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-5">Name & Contact</th>
                    <th className="py-3 px-5">Role Badge</th>
                    <th className="py-3 px-5">Permissions Summary</th>
                    <th className="py-3 px-5 text-right">Role Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800">{u.name}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>

                      <td className="py-3.5 px-5">
                        <RoleBadge role={u.role} size="md" />
                      </td>

                      <td className="py-3.5 px-5 text-xs text-slate-600">
                        {u.role === 'admin' && 'Admin: Full CRUD access to add, edit, and delete transactions'}
                        {u.role === 'user' && 'User (Gmail): Read-Only access to view all balances and ledger'}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {isAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
                          >
                            <option value="admin">Admin (Full CRUD)</option>
                            <option value="user">User (View Only)</option>
                          </select>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium capitalize">{u.role}</span>
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
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">Financial Audit Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every transaction creation, update, and soft deletion is permanently recorded for transparency.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Performed By</th>
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isCreate = log.action === 'create';
                      const isUpdate = log.action === 'update';
                      const isDelete = log.action === 'delete';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {formatDateTime(log.createdAt)}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {isCreate && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Created
                              </span>
                            )}
                            {isUpdate && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                Updated
                              </span>
                            )}
                            {isDelete && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Soft Deleted
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                            {log.performedByName || 'Staff'}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                            {log.transactionId}
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            {log.newData?.category && (
                              <span>
                                {log.newData.category} • {formatINR(log.newData.amount || 0)}
                              </span>
                            )}
                            {log.previousData && log.newData && (
                              <span className="text-[11px] text-slate-400 block">
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
