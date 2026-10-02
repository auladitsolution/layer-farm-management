'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-green-800 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl font-extrabold text-white shadow-inner">
            প
          </div>
          <h1 className="text-2xl font-bold tracking-tight"> লেয়ার ফার্ম ম্যানেজার</h1>
          <p className="text-emerald-100 text-xs mt-1">
            আধুনিক লেয়ার ফার্ম ব্যবস্থাপনা সফটওয়্যার
          </p>
          <span className="inline-block mt-2 text-[11px] bg-emerald-950/40 text-emerald-200 px-3 py-0.5 rounded-full font-medium">
            আওলাদ আইটি সলিউশন (Aulad IT Solution)
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <div>
            <Button
              onClick={handleGoogleLogin}
              isLoading={loading}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs flex items-center justify-center gap-3 font-semibold text-sm"
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
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">
              অথবা ডেমো হিসেবে প্রবেশ করুন
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              টেস্টিং এবং মূল্যায়নের জন্য যেকোনো ভূমিকায় প্রবেশ করুন:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {(['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY_MANAGER', 'STAFF'] as UserRole[]).map(
                (role) => (
                  <button
                    key={role}
                    type="button"
                    disabled={loading}
                    onClick={() => handleDemoLogin(role)}
                    className="flex items-center justify-between px-3.5 py-2 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all text-left text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold text-slate-800">{ROLE_LABELS_BN[role]}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 group-hover:text-emerald-700 font-medium">
                      প্রবেশ করুন →
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          সুরক্ষিত ক্লাউড সার্ভার • একক ক্লায়েন্ট ডেডিকেটেড ইনস্ট্যান্স
        </div>
      </div>
    </div>
  );
}
