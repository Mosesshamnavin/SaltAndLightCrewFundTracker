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
  ShieldCheck,
  User as UserIcon,
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
  const pathname = usePathname();
  const crewName = settings?.churchName || 'Salt and Light Crew';

  // Dropdown states
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

  // Close dropdowns on outside click
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[68px] relative">
          
          {/* 1. LEFT: Brand Lockup */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Salt and Light Logo"
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-slate-900 tracking-tight leading-none group-hover:text-primary transition-colors">
                {crewName}
              </span>
              <span className="text-[11px] font-medium text-slate-500 tracking-normal mt-1 leading-none">
                Fund Tracker
              </span>
            </div>
          </Link>

          {/* 2. CENTER: Clean Minimal Navigation */}
          <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/70 shadow-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon
                    size={14}
                    className={isActive ? 'text-primary' : 'text-slate-400'}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT: Unified Add Transaction Action & User Profile */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Unified + Add Transaction Dropdown Button (Admin Only) */}
            {isAdmin && (
              <div className="relative" ref={actionRef}>
                <button
                  type="button"
                  onClick={() => setIsActionOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover active:scale-[0.98] text-white rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer"
                  aria-expanded={isActionOpen}
                  aria-haspopup="true"
                >
                  <Plus size={14} className="stroke-[2.5]" />
                  <span className="hidden sm:inline">Add Transaction</span>
                  <span className="sm:hidden">Add</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-150 ml-0.5 ${
                      isActionOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu for Income / Expense */}
                {isActionOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-dropdown border border-slate-200/80 py-1.5 z-50 animate-fadeIn">
                    {/* Add Income Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionOpen(false);
                        onAddIncome();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-left cursor-pointer"
                    >
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Plus size={12} className="stroke-[2.5]" />
                      </span>
                      <span className="font-semibold">Add Income</span>
                    </button>

                    {/* Add Expense Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionOpen(false);
                        onAddExpense();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-rose-50 hover:text-rose-800 transition-colors text-left cursor-pointer border-t border-slate-100"
                    >
                      <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <Minus size={12} className="stroke-[2.5]" />
                      </span>
                      <span className="font-semibold">Add Expense</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Profile */}
            <div className="relative pl-1" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200/60 transition-all cursor-pointer"
                aria-expanded={isProfileOpen}
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {userInitial}
                </div>
                <span className="text-xs font-semibold text-slate-800 hidden sm:block">
                  {firstName}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-slate-400 transition-transform duration-150 hidden sm:block ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Minimal Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-dropdown border border-slate-200/80 py-1.5 z-50 animate-fadeIn">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {user?.name || 'Youth Member'}
                      </p>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
                        isAdmin 
                          ? 'bg-primary-50 text-primary-800 border border-primary-200/60' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {isAdmin ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email || 'user@saltandlight.in'}
                    </p>
                  </div>

                  {/* Navigation shortcuts inside profile */}
                  <div className="py-1">
                    <Link
                      href="/reports"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <BarChart3 size={14} className="text-slate-400" />
                      <span>Financial Reports</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={14} className="text-slate-400" />
                        <span>Settings & Roles</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-1.5 pb-2.5 pt-1.5 border-t border-slate-200/70 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900'
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
