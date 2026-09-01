'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Minus,
  LogOut,
  Sparkles,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddIncome,
  onAddExpense,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_25px_-4px_rgba(15,23,42,0.04)] select-none transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* 1. Left: Brand Lockup */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-11 h-11 rounded-2xl shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-all duration-200 border border-slate-200/80 bg-slate-900 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Salt and Light Logo"
                  width={44}
                  height={44}
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[17px] font-black text-slate-900 tracking-tight group-hover:text-[#0F766E] transition-colors">
                    Salt and Light Crew
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-[#0F766E] border border-teal-200/80 shadow-2xs">
                    INR ₹
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <span className="tracking-tight text-slate-400 font-medium">Church Fund Tracker</span>
                </p>
              </div>
            </Link>

            {/* 2. Center: Segmented Navigation Bar */}
            <nav className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0F766E] text-white shadow-md shadow-teal-950/20 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 3. Right: Control Actions + User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Action Buttons */}
            {isAdmin && (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onAddIncome}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-900/15 transition-all cursor-pointer hover:shadow-lg hover:shadow-emerald-900/20"
                >
                  <Plus size={15} className="stroke-[3]" />
                  <span className="hidden sm:inline">Add</span> Income
                </button>
                <button
                  type="button"
                  onClick={onAddExpense}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-rose-900/15 transition-all cursor-pointer hover:shadow-lg hover:shadow-rose-900/20"
                >
                  <Minus size={15} className="stroke-[3]" />
                  <span className="hidden sm:inline">Add</span> Expense
                </button>
              </div>
            )}

            {/* User Profile Card */}
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200">
              <div className="flex items-center gap-3 bg-slate-50/80 hover:bg-slate-100/80 p-1.5 pr-3 rounded-2xl border border-slate-200/70 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F766E] to-teal-400 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-teal-900/20 border border-teal-600/30">
                  {userInitial}
                </div>

                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-snug truncate max-w-[130px]">
                    {user?.name || 'Moses Sham Navin'}
                  </p>
                  <div className="flex items-center gap-1">
                    {isAdmin && <Shield size={10} className="text-[#0F766E]" />}
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Icon Button */}
              <button
                type="button"
                onClick={() => logout()}
                title="Sign out of ledger"
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
                aria-label="Sign out"
              >
                <LogOut size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-2 pb-3 pt-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-md shadow-teal-950/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                <Icon size={15} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
