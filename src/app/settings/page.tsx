'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import {
  Settings as SettingsIcon,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Sliders,
} from 'lucide-react';
import { IUser } from '@/types';
import { ROLE_LABELS_BN } from '@/lib/roles';

export default function SettingsPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'audit'>('settings');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    farmName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    currency: '৳ BDT',
    traySize: '30',
    lowFeedThresholdKg: '200',
    highMortalityThresholdPercent: '1.5',
    medicineExpiryNoticeDays: '30',
  });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchInitialData = async () => {
    try {
      const [uRes, sRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/settings').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (sRes) {
        setSettingsForm({
          farmName: sRes.farmName || '',
          ownerName: sRes.ownerName || '',
          phone: sRes.phone || '',
          email: sRes.email || '',
          address: sRes.address || '',
          currency: sRes.currency || '৳ BDT',
          traySize: String(sRes.traySize || 30),
          lowFeedThresholdKg: String(sRes.lowFeedThresholdKg || 200),
          highMortalityThresholdPercent: String(sRes.highMortalityThresholdPercent || 1.5),
          medicineExpiryNoticeDays: String(sRes.medicineExpiryNoticeDays || 30),
        });
      }

      // If user is owner, fetch audit logs
      if (uRes?.user?.role === 'OWNER') {
        const aRes = await fetch('/api/audit-logs');
        if (aRes.ok) {
          const logs = await aRes.json();
          setAuditLogs(Array.isArray(logs) ? logs : []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settingsForm,
          traySize: Number(settingsForm.traySize) || 30,
          lowFeedThresholdKg: Number(settingsForm.lowFeedThresholdKg) || 200,
          highMortalityThresholdPercent: Number(settingsForm.highMortalityThresholdPercent) || 1.5,
          medicineExpiryNoticeDays: Number(settingsForm.medicineExpiryNoticeDays) || 30,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');

      setFeedback({ type: 'success', message: 'খামারের সেটিংস সফলভাবে হালনাগাদ করা হয়েছে!' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                খামার সেটিংস ও অডিট লগ
              </h2>
              <Badge variant="emerald">সিস্টেম কনফিগারেশন</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              খামারের তথ্য, ট্রে মাপ, সতর্কবার্তা থ্রেশহোল্ড এবং গুরুত্বপূর্ণ কর্মকাণ্ডের অডিট ট্রেইল
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            খামার ও ব্যবসায়িক সেটিংস
          </button>
          {user?.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
                activeTab === 'audit'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              অডিট লগ ট্রেইল ({toBengaliNumber(auditLogs.length)})
            </button>
          )}
        </div>

        {/* TAB 1: Farm Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings}>
            <div className="space-y-6">
              {/* Farm Identity Card */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>খামারের পরিচয় ও যোগাযোগ তথ্য</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      চালান, রসিদ এবং প্রতিবেদনে এই তথ্যসমূহ প্রদর্শিত হবে
                    </p>
                  </div>
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="খামারের নাম"
                    value={settingsForm.farmName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, farmName: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="খামার মালিকের নাম"
                    value={settingsForm.ownerName}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, ownerName: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="মোবাইল নম্বর"
                    value={settingsForm.phone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    required
                  />

                  <Input
                    label="ইমেইল ঠিকানা"
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      label="খামারের ঠিকানা ও লোকেশন"
                      value={settingsForm.address}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, address: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Business Rules & Conversions */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>উৎপাদন, ট্রে রূপান্তর ও সতর্কবার্তা থ্রেশহোল্ড</CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      পোল্ট্রি হিসাব ও সতর্কবার্তার স্বয়ংক্রিয় মাপকাঠি
                    </p>
                  </div>
                </CardHeader>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="প্রতি ট্রের ডিমের সংখ্যা"
                    type="number"
                    min="1"
                    value={settingsForm.traySize}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, traySize: e.target.value })
                    }
                    helperText="সাধারণত ৩০টি ডিম = ১ ট্রে"
                    required
                  />

                  <Input
                    label="খাদ্যের সতর্কসীমা (কেজি)"
                    type="number"
                    min="10"
                    value={settingsForm.lowFeedThresholdKg}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, lowFeedThresholdKg: e.target.value })
                    }
                    helperText="স্টক এর নিচে নামলে সতর্কবার্তা আসবে"
                    required
                  />

                  <Input
                    label="মৃত্যুহারের সতর্কসীমা (%)"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={settingsForm.highMortalityThresholdPercent}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        highMortalityThresholdPercent: e.target.value,
                      })
                    }
                    helperText="দৈনিক মৃত্যুহারের অ্যালার্ট সীমা"
                    required
                  />

                  <Input
                    label="ওষুধ মেয়াদোত্তীর্ণের নোটিশ (দিন)"
                    type="number"
                    min="1"
                    value={settingsForm.medicineExpiryNoticeDays}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        medicineExpiryNoticeDays: e.target.value,
                      })
                    }
                    helperText="মেয়াদ শেষের কত দিন আগে অ্যালার্ট দেবে"
                    required
                  />
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  icon={<Save className="w-5 h-5" />}
                  className="px-8"
                >
                  সেটিংস সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: Audit Logs */}
        {activeTab === 'audit' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>সিস্টেম অডিট ট্রেইল (Audit Trail)</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  বিক্রয় চালান, পেমেন্ট, স্টক সমন্বয় ও ব্যবহারকারী কর্মকাণ্ডের অপরিবর্তনযোগ্য লগ
                </p>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">সময় ও তারিখ</th>
                    <th className="py-3 px-4">ব্যবহারকারী</th>
                    <th className="py-3 px-4">ভূমিকা</th>
                    <th className="py-3 px-4">অ্যাকশন</th>
                    <th className="py-3 px-4">মডিউল</th>
                    <th className="py-3 px-4">কার্যক্রমের বিবরণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70 text-xs">
                      <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap">
                        {formatBengaliDate(log.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{log.userName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="slate">{ROLE_LABELS_BN[log.userRole as keyof typeof ROLE_LABELS_BN] || log.userRole}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            log.action === 'CREATE'
                              ? 'emerald'
                              : log.action === 'ADJUSTMENT'
                              ? 'amber'
                              : 'slate'
                          }
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{log.module}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
