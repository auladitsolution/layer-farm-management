'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardPenLine,
  Layers,
  Egg,
  ShoppingCart,
  Wheat,
  Syringe,
  Wallet,
  Calculator,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';

interface SidebarProps {
  userRole?: UserRole;
  farmName?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { name: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
  { name: 'দৈনিক এন্ট্রি', href: '/daily-entry', icon: ClipboardPenLine },
  { name: 'শেড ও ফ্লক/ব্যাচ', href: '/flocks', icon: Layers, roles: ['OWNER', 'MANAGER'] },
  { name: 'ডিম উৎপাদন ও স্টক', href: '/egg-production', icon: Egg },
  { name: 'বিক্রয় ও কাস্টমার', href: '/sales', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
  { name: 'খাদ্য ব্যবস্থাপনা', href: '/feed', icon: Wheat, roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'] },
  { name: 'ওষুধ ও টিকাদান', href: '/health', icon: Syringe, roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'] },
  { name: 'আয় ও ব্যয়', href: '/finance', icon: Wallet, roles: ['OWNER', 'ACCOUNTANT'] },
  { name: 'ডিম উৎপাদন খরচ', href: '/cost-analysis', icon: Calculator, roles: ['OWNER', 'ACCOUNTANT', 'MANAGER'] },
  { name: 'ফার্ম কর্মী', href: '/employees', icon: Users, roles: ['OWNER', 'MANAGER'] },
  { name: 'রিপোর্ট ও বিশ্লেষণ', href: '/reports', icon: BarChart3, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
  { name: 'সেটিংস', href: '/settings', icon: Settings, roles: ['OWNER'] },
];

export const Sidebar: React.FC<SidebarProps> = ({
  userRole = 'OWNER',
  farmName = 'আওলাদ পোল্ট্রি ফার্ম',
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (userRole === 'OWNER') return true;
    return item.roles.includes(userRole);
  });

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 z-30 select-none min-h-screen sticky top-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              ব
            </div>
            <div className="truncate">
              <h1 className="font-bold text-slate-100 text-sm truncate leading-tight">{farmName}</h1>
              <span className="text-[11px] text-emerald-400 font-medium">বাণিজ্যিক লেয়ার খামার</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            ব
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors',
            collapsed && 'hidden'
          )}
          title={collapsed ? 'প্রসারিত করুন' : 'সংকুচিত করুন'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-slate-300 font-medium truncate">
            {ROLE_LABELS_BN[userRole] || userRole}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800 text-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>সংকুচিত করুন</span>}
        </button>
      </div>
    </aside>
  );
};
