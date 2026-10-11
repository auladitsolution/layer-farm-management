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
  Sparkles,
} from 'lucide-react';
import { UserRole, IUser } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';
import { Button } from '@/components/ui/Button';
import { fetchData, isDemoMode } from '@/lib/api-client';

interface HeaderNotification {
  _id?: string;
  type?: 'WARNING' | 'ALERT' | 'SUCCESS' | 'INFO';
  title: string;
  message: string;
  isRead?: boolean;
}

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
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isDemo = isDemoMode();

  useEffect(() => {
    // Fetch notifications using conditional data fetching logic
    fetchData<HeaderNotification[]>('/api/notifications')
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('poultry_demo_role', role);
      document.cookie = `poultry_demo_role=${role}; path=/; max-age=604800`;
    }
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

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Mobile Menu & Brand & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="md:hidden font-bold text-slate-800 text-sm">{farmName}</span>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative w-64 md:w-80 group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="খামার, কাস্টমার, চালান খুঁজুন..."
            className="w-full pl-10 pr-12 py-2 bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-slate-200/90 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-600 shadow-2xs transition-all"
          />
          <kbd className="hidden lg:inline-block absolute right-3 pointer-events-none text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 font-sans shadow-2xs">
            Ctrl+K
          </kbd>
        </form>
      </div>

      {/* Right Actions: Live Status, Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live / Demo system status badge */}
        {isDemo ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>ডেমো মোড (মক ডেটা)</span>
          </div>
        ) : (
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>সিস্টেম লাইভ</span>
          </div>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 relative transition-all cursor-pointer"
            title="বিজ্ঞপ্তি"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-40 animate-in fade-in duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <span className="font-bold text-slate-800 text-sm">বিজ্ঞপ্তি ও সতর্কবার্তা</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {unreadCount}টি অপঠিত
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    কোনো নতুন বিজ্ঞপ্তি নেই
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 hover:bg-slate-50/80 transition-colors flex gap-3 ${
                        !notif.isRead ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {notif.type === 'WARNING' || notif.type === 'ALERT' ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : notif.type === 'SUCCESS' ? (
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
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
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-2.5 rounded-xl hover:bg-slate-100/80 transition-all text-left cursor-pointer border border-transparent hover:border-slate-200/60"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-emerald-500/20">
              {user?.displayName ? user.displayName.charAt(0) : <User className="w-4 h-4" />}
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.displayName || 'ব্যবহারকারী'}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold leading-tight">
                {user?.role ? ROLE_LABELS_BN[user.role] : 'ফার্ম সদস্য'}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-40 p-2.5 animate-in fade-in duration-150">
              <div className="p-2.5 border-b border-slate-100 mb-2">
                <p className="text-xs font-bold text-slate-800">{user?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg font-semibold border border-emerald-200/60">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{user?.role ? ROLE_LABELS_BN[user.role] : 'অ্যাক্টিভ'}</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                </div>
              </div>

              {/* Demo Role Switcher for live inspection */}
              <div className="px-2 py-1 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  ভূমিকা পরিবর্তন (Demo)
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {(['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'STAFF'] as UserRole[]).map(
                    (role) => (
                      <button
                        key={role}
                        onClick={() => switchDemoRole(role)}
                        className={`text-xs text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                          user?.role === role
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100/80'
                        }`}
                      >
                        <span>{ROLE_LABELS_BN[role]}</span>
                        {user?.role === role && <span className="text-[10px] text-white/90">✓ সক্রিয়</span>}
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
                  className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 rounded-lg"
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

