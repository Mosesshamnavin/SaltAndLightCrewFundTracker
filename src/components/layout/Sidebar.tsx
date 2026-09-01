'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
  ];

  return (
    <aside className="w-64 h-full bg-[#0F766E] text-white flex flex-col justify-between select-none border-r border-[#0d635c]">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="Salt and Light Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              Fund Tracker
            </h1>
            <p className="text-[11px] text-teal-100 truncate">
              Salt & Light Crew
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold shadow-sm'
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-teal-200'} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Clean User Profile & Logout */}
      <div className="p-4 border-t border-white/10 bg-[#0d635c]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-teal-200 truncate">
              {user?.email}
            </p>
          </div>

          <button
            onClick={() => logout()}
            title="Log out"
            className="p-2 text-teal-200 hover:text-rose-200 hover:bg-white/10 rounded-xl transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
