'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Wallet,
  Wheat,
  Users,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';

const roleMeta: Record<UserRole, { icon: React.ElementType; color: string; desc: string }> = {
  OWNER: { icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-500/10', desc: 'সকল মডিউলে পূর্ণ নিয়ন্ত্রণ' },
  MANAGER: { icon: ClipboardList, color: 'text-teal-600 bg-teal-500/10', desc: 'দৈনিক তদারকি ও রিপোর্ট' },
  ACCOUNTANT: { icon: Wallet, color: 'text-sky-600 bg-sky-500/10', desc: 'আয়-ব্যয়, বিক্রয় ও চালান' },
  INVENTORY_MANAGER: { icon: Wheat, color: 'text-amber-600 bg-amber-500/10', desc: 'খাদ্য ও ওষুধের স্টক' },
  STAFF: { icon: Users, color: 'text-slate-600 bg-slate-500/10', desc: 'দৈনিক তথ্য এন্ট্রি' },
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'লগইন প্রক্রিয়া ব্যর্থ হয়েছে');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ডেমো লগইন ব্যর্থ হয়েছে');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'লগইন করতে সমস্যা হয়েছে';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#071719] to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative z-10 transition-all duration-300">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-7 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-[ellipse_at_top,_var(--tw-gradient-stops)] from-white/10 to-transparent pointer-events-none" />

          <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl font-black text-white shadow-lg ring-4 ring-white/10">
            ব
          </div>
          <h1 className="text-2xl font-black tracking-tight drop-shadow-xs">বিসমিল্লাহ লেয়ার ফার্ম</h1>
          <p className="text-emerald-100 text-xs mt-1 font-medium">
            বাণিজ্যিক লেয়ার খামার ব্যবস্থাপনা সফটওয়্যার
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] bg-slate-950/40 text-emerald-200 px-3 py-1 rounded-full font-medium border border-emerald-400/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>আওলাদ আইটি সলিউশন (Aulad IT Solution)</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <div>
            <Button
              onClick={handleGoogleLogin}
              isLoading={loading}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300/90 shadow-xs flex items-center justify-center gap-3 font-bold text-sm rounded-xl active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google দিয়ে লগইন করুন
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200/90 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              অথবা এক ক্লিকে ডেমো প্রবেশ
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              টেস্টিং এবং মূল্যায়নের জন্য ভূমিকা নির্বাচন করুন:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'STAFF'] as UserRole[]).map(
                (role) => {
                  const meta = roleMeta[role];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoLogin(role)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200/90 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all text-left group cursor-pointer active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.color} group-hover:scale-105 transition-transform`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block leading-tight">
                            {ROLE_LABELS_BN[role]}
                          </span>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            {meta.desc}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 group-hover:text-emerald-700 font-semibold transition-colors">
                        প্রবেশ →
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
          সুরক্ষিত ক্লাউড সার্ভার • বাণিজ্যিক লেয়ার খামার অটোমেশন
        </div>
      </div>
    </div>
  );
}

