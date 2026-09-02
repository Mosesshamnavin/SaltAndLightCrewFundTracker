'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  Minus,
  LogOut,
  ChevronDown,
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

  // Dropdown states
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const actionRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
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
  const firstName = user?.name ? user.name.split(' ')[0] : 'Moses';

  return (
    <header className="sticky top-0 z-50 bg-[#F9F9F6] border-b border-[#ECE9E2] select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] relative">
          
          {/* 1. LEFT: Brand Lockup */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#0D1522] flex items-center justify-center transition-opacity group-hover:opacity-90">
              <Image
                src="/logo.png"
                alt="Salt & Light Logo"
                width={32}
                height={32}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[14px] font-bold text-[#1C1C1E] tracking-tight leading-none">
                Salt & Light Crew
              </span>
              <span className="text-[11px] font-normal text-[#737373] tracking-normal mt-1 leading-none">
                Fund Tracker
              </span>
            </div>
          </Link>

          {/* 2. CENTER: Clean Minimal Navigation */}
          <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-1 p-1 rounded-lg bg-black/[0.03]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-[#0D1522] text-white font-medium shadow-xs'
                      : 'text-[#737373] hover:text-[#1C1C1E] hover:bg-black/[0.04] font-medium'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-[#737373]'} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. RIGHT: Unified Add Transaction Action & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Unified + Add Transaction Dropdown Button */}
            {isAdmin && (
              <div className="relative" ref={actionRef}>
                <button
                  type="button"
                  onClick={() => setIsActionOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#238B6F] hover:bg-[#1e785f] active:scale-[0.98] text-white rounded-lg text-xs font-semibold shadow-xs transition-all duration-150 cursor-pointer"
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
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-[#ECE9E2] py-1 z-50 animate-fadeIn">
                    {/* Add Income Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionOpen(false);
                        onAddIncome();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#1C1C1E] hover:bg-emerald-50/70 transition-colors text-left cursor-pointer"
                    >
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-[#238B6F] flex items-center justify-center shrink-0">
                        <Plus size={12} className="stroke-[3]" />
                      </span>
                      <span>Add Income</span>
                    </button>

                    {/* Add Expense Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsActionOpen(false);
                        onAddExpense();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-[#D95763] hover:bg-rose-50/70 transition-colors text-left cursor-pointer border-t border-[#ECE9E2]/60"
                    >
                      <span className="w-5 h-5 rounded-md bg-rose-100 text-[#D95763] flex items-center justify-center shrink-0">
                        <Minus size={12} className="stroke-[3]" />
                      </span>
                      <span>Add Expense</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Simple User Profile */}
            <div className="relative pl-1 sm:pl-2" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-black/[0.04] transition-colors cursor-pointer"
                aria-expanded={isProfileOpen}
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#0D1522] text-white flex items-center justify-center font-semibold text-xs">
                  {userInitial}
                </div>
                <span className="text-xs font-medium text-[#1C1C1E] hidden sm:block">
                  {firstName}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-[#737373] transition-transform duration-150 hidden sm:block ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Minimal Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-[#ECE9E2] py-1.5 z-50 animate-fadeIn">
                  <div className="px-3.5 py-2 border-b border-[#ECE9E2]">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#1C1C1E] truncate">
                        {user?.name || 'Moses Sham Navin'}
                      </p>
                      <span className="text-[10px] font-medium text-[#737373] bg-[#F9F9F6] border border-[#ECE9E2] px-1.5 py-0.5 rounded">
                        {isAdmin ? 'Admin' : 'Member'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373] truncate mt-0.5">
                      {user?.email || 'admin@saltandlight.in'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#D95763] hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2 pb-2.5 pt-1 border-t border-[#ECE9E2]">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0D1522] text-white font-medium shadow-xs'
                    : 'bg-[#F0F0EE] text-[#737373] hover:text-[#1C1C1E]'
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
