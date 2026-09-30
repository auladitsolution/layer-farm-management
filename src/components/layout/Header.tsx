'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { UserRole, IUser } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  user: IUser | null;
  onMobileMenuToggle?: () => void;
  farmName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onMobileMenuToggle,
  farmName = 'আওলাদ পোল্ট্রি ফার্ম',
}) => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch notifications
    fetch('/api/notifications')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const switchDemoRole = async (role: UserRole) => {
    const res = await fetch('/api/auth/demo-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Mobile Menu & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="md:hidden font-bold text-slate-800 text-sm">{farmName}</span>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-64 md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="খামার, কাস্টমার, চালান খুঁজুন..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
          />
        </form>
      </div>

      {/* Right Actions: Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative transition-colors"
            title="বিজ্ঞপ্তি"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-40 animate-in fade-in duration-150">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="font-semibold text-slate-800 text-sm">বিজ্ঞপ্তি ও সতর্কবার্তা</span>
                <span className="text-xs text-slate-500">
                  {notifications.filter((n) => !n.isRead).length}টি অপঠিত
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">কোনো নতুন বিজ্ঞপ্তি নেই</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 hover:bg-slate-50 transition-colors flex gap-3 ${
                        !notif.isRead ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {notif.type === 'WARNING' || notif.type === 'ALERT' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      ) : notif.type === 'SUCCESS' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-semibold text-sm">
              {user?.displayName ? user.displayName.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.displayName || 'ব্যবহারকারী'}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium leading-tight">
                {user?.role ? ROLE_LABELS_BN[user.role] : 'ফার্ম সদস্য'}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-40 p-2 animate-in fade-in duration-150">
              <div className="p-2 border-b border-slate-100 mb-2">
                <p className="text-xs font-semibold text-slate-800">{user?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.role ? ROLE_LABELS_BN[user.role] : 'অ্যাক্টিভ'}
                </div>
              </div>

              {/* Demo Role Switcher for live inspection */}
              <div className="px-2 py-1 mb-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  ভূমিকা পরিবর্তন (Demo)
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {(['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'STAFF'] as UserRole[]).map(
                    (role) => (
                      <button
                        key={role}
                        onClick={() => switchDemoRole(role)}
                        className={`text-xs text-left px-2 py-1 rounded-md transition-colors flex items-center justify-between ${
                          user?.role === role
                            ? 'bg-emerald-100 text-emerald-800 font-medium'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span>{ROLE_LABELS_BN[role]}</span>
                        {user?.role === role && <span className="text-[10px] text-emerald-700">✓ সক্রিয়</span>}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  icon={<LogOut className="w-4 h-4" />}
                >
                  লগআউট করুন
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
