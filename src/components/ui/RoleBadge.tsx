import React from 'react';
import { UserRole } from '@/types';
import { ShieldAlert, Eye } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';
  const iconSize = isSmall ? 12 : 15;

  if (role === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200 ${sizeClasses}`}
      >
        <ShieldAlert size={iconSize} className="text-purple-600" />
        Admin (Full CRUD)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}
    >
      <Eye size={iconSize} className="text-slate-500" />
      User (View Only)
    </span>
  );
};
