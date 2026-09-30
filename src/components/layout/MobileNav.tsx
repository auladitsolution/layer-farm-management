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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-slate-100 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">
              প
            </div>
            <span className="font-bold text-sm truncate">{farmName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300 font-medium">
            {ROLE_LABELS_BN[userRole] || userRole}
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
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
