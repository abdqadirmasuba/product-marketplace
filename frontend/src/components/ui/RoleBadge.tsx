'use client';

import { Role } from '@/types';

interface RoleBadgeProps {
  role: Role;
}

const roleConfig = {
  admin: {
    label: 'Admin',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  approver: {
    label: 'Approver',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  editor: {
    label: 'Editor',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
};

export default function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role];

  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
}
