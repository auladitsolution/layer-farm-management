'use client';

import React from 'react';
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
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
  farmName?: string;
}

const navItems = [
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

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  userRole = 'OWNER',
  farmName = 'আওলাদ পোল্ট্রি ফার্ম',
}) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (userRole === 'OWNER') return true;
    return item.roles.includes(userRole);
  });

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-gradient-to-b from-slate-950 via-[#0a101d] to-slate-950 text-slate-100 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-250 border-r border-slate-800/80">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              ব
            </div>
            <div>
              <span className="font-bold text-sm truncate block text-slate-100">{farmName}</span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">বাণিজ্যিক লেয়ার</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mx-3 mt-3 px-3 py-2 bg-slate-900/90 rounded-xl border border-slate-800/90 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">
              {ROLE_LABELS_BN[userRole] || userRole}
            </span>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md font-medium border border-emerald-500/20 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> সক্রিয়
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white font-semibold shadow-md shadow-emerald-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

