'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Settings,
  Plus,
  Minus,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/context/TransactionContext';

interface HeaderProps {
  onAddIncome: () => void;
  onAddExpense: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddIncome,
  onAddExpense,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useTransactions();
  const crewName = settings?.churchName || 'Salt and Light Crew';
  const pathname = usePathname();

  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const actionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = isAdmin
    ? [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transactions', icon: Receipt },
        { href: '/reports', label: 'Reports', icon: BarChart3 },
        { href: '/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transactions', icon: Receipt },
        { href: '/reports', label: 'Reports', icon: BarChart3 },
      ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsActionOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'M';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Youth';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px]">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-teal-700 ring-offset-2 ring-offset-white flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Salt and Light Logo"
                width={36}
                height={36}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
                {crewName}
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1 leading-none">
                Fund Tracker
              </span>
            </div>
          </Link>

          {/* Desktop Nav — underline-on-active, no pill background */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <link.icon size={15} />
                  {link.label}
                  {isActive && (
                    <span className="absolute left-3.5 right-3.5 -bottom-[1px] h-[2px] bg-teal-700 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions + Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <div className="relative" ref={actionRef}>
                <button
                  type="button"
                  onClick={() => setIsActionOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer"
                  aria-expanded={isActionOpen}
                  aria-haspopup="true"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span className="hidden sm:inline">Add Transaction</span>
                  <span className="sm:hidden">Add</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-150 ${isActionOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isActionOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                    <button
                      type="button"
                      onClick={() => { setIsActionOpen(false); onAddIncome(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                    >
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Plus size={12} className="stroke-[2.5]" />
                      </span>
                      <span className="font-semibold">Add Income</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsActionOpen(false); onAddExpense(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-rose-50 hover:text-rose-800 transition-colors text-left cursor-pointer border-t border-slate-100"
                    >
                      <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <Minus size={12} className="stroke-[2.5]" />
                      </span>
                      <span className="font-semibold">Add Expense</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            <div className="relative pl-1" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-expanded={isProfileOpen}
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                  {userInitial}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:block">
                  {firstName}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-150 hidden sm:block ${isProfileOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user?.name || 'Youth Member'}
                      </p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isAdmin
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {isAdmin ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email || 'user@saltandlight.in'}
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsProfileOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={13} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1.5 pb-2.5 pt-1.5 border-t border-slate-200 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={13} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};