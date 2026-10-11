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
  Sparkles,
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
  category?: 'main' | 'operations' | 'management';
}

const navItems: NavItem[] = [
  { name: 'ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard, category: 'main' },
  { name: 'দৈনিক এন্ট্রি', href: '/daily-entry', icon: ClipboardPenLine, category: 'main' },
  { name: 'শেড ও ফ্লক/ব্যাচ', href: '/flocks', icon: Layers, roles: ['OWNER', 'MANAGER'], category: 'operations' },
  { name: 'ডিম উৎপাদন ও স্টক', href: '/egg-production', icon: Egg, category: 'operations' },
  { name: 'বিক্রয় ও কাস্টমার', href: '/sales', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'], category: 'operations' },
  { name: 'খাদ্য ব্যবস্থাপনা', href: '/feed', icon: Wheat, roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'], category: 'operations' },
  { name: 'ওষুধ ও টিকাদান', href: '/health', icon: Syringe, roles: ['OWNER', 'MANAGER', 'INVENTORY_MANAGER'], category: 'operations' },
  { name: 'আয় ও ব্যয়', href: '/finance', icon: Wallet, roles: ['OWNER', 'ACCOUNTANT'], category: 'management' },
  { name: 'ডিম উৎপাদন খরচ', href: '/cost-analysis', icon: Calculator, roles: ['OWNER', 'ACCOUNTANT', 'MANAGER'], category: 'management' },
  { name: 'ফার্ম কর্মী', href: '/employees', icon: Users, roles: ['OWNER', 'MANAGER'], category: 'management' },
  { name: 'রিপোর্ট ও বিশ্লেষণ', href: '/reports', icon: BarChart3, roles: ['OWNER', 'MANAGER', 'ACCOUNTANT'], category: 'management' },
  { name: 'সেটিংস', href: '/settings', icon: Settings, roles: ['OWNER'], category: 'management' },
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
        'hidden md:flex flex-col bg-gradient-to-b from-slate-950 via-[#0a101d] to-slate-950 text-slate-200 border-r border-slate-800/80 transition-all duration-300 z-30 select-none min-h-screen sticky top-0 shadow-xl',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/70 bg-slate-950/60 backdrop-blur-md">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30 shrink-0">
              ব
            </div>
            <div className="truncate">
              <h1 className="font-bold text-slate-100 text-sm truncate leading-tight tracking-tight">
                {farmName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  বাণিজ্যিক লেয়ার
                </span>
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            ব
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition-all cursor-pointer',
            collapsed && 'hidden'
          )}
          title={collapsed ? 'প্রসারিত করুন' : 'সংকুচিত করুন'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800/90 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs text-slate-300 font-semibold truncate">
              {ROLE_LABELS_BN[userRole] || userRole}
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium border border-emerald-500/20 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> সক্রিয়
          </span>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 hover:translate-x-0.5',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              {isActive && (
                <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-white/80 rounded-full" />
              )}
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                )}
              />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-800/70 bg-slate-950/40 text-center">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-all cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>সংকুচিত করুন</span>}
        </button>
      </div>
    </aside>
  );
};

