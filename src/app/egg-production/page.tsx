'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import { Egg, Warehouse, AlertTriangle, Sliders, CheckCircle } from 'lucide-react';
import { IUser } from '@/types';

export default function EggProductionPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [productionEntries, setProductionEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    goodPieces: '',
    brokenPieces: '',
    dirtyPieces: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, invRes, prodRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/eggs/inventory').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/daily-entry?limit=30').then((r) => (r.ok ? r.json() : [])),
      ]);
      if (uRes?.user) setUser(uRes.user);
      if (invRes) {
        setInventoryData(invRes);
        setAdjustForm({
          goodPieces: String(invRes.inventory?.goodPieces || 0),
          brokenPieces: String(invRes.inventory?.brokenPieces || 0),
          dirtyPieces: String(invRes.inventory?.dirtyPieces || 0),
          reason: '',
        });
      }
      if (Array.isArray(prodRes)) setProductionEntries(prodRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const good = Number(adjustForm.goodPieces) || 0;
      const broken = Number(adjustForm.brokenPieces) || 0;
      const dirty = Number(adjustForm.dirtyPieces) || 0;
      const total = good + broken + dirty;

      const res = await fetch('/api/eggs/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goodPieces: good,
          brokenPieces: broken,
          dirtyPieces: dirty,
          totalPieces: total,
          reason: adjustForm.reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সমন্বয় ব্যর্থ হয়েছে');

      setFeedback({ type: 'success', message: 'ডিমের স্টক সফলভাবে সমন্বয় করা হয়েছে!' });
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const inv = inventoryData?.inventory || {};
  const traySize = inventoryData?.traySize || 30;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                ডিম উৎপাদন ও স্টক ব্যবস্থাপনা
              </h2>
              <Badge variant="emerald">মজুদ খতিয়ান</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              দৈনিক ভালো ও নষ্ট ডিমের মজুদ এবং ট্রে রূপান্তর হিসাব (১ ট্রে = {toBengaliNumber(traySize)}টি ডিম)
            </p>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsAdjustModalOpen(true)}
            icon={<Sliders className="w-4 h-4" />}
          >
            স্টক সমন্বয় করুন (Adjust)
          </Button>
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
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Stock Breakdown KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saleable Good Eggs */}
          <Card className="bg-emerald-50/50 border-emerald-200/80">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              বিক্রয়যোগ্য ভালো ডিম
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950">
                {toBengaliNumber(inv.goodPieces || 0)}
              </span>
              <span className="text-sm text-emerald-700">টি</span>
            </div>
            <div className="mt-2 pt-2 border-t border-emerald-200/60 text-xs text-emerald-800 font-semibold">
              ট্রে হিসেবে: {toBengaliNumber(Math.floor((inv.goodPieces || 0) / traySize))} ট্রে{' '}
              {inv.goodPieces % traySize > 0 &&
                `(${toBengaliNumber(inv.goodPieces % traySize)}টি অতিরিক্ত)`}
            </div>
          </Card>

          {/* Card 2: Total Trays */}
          <Card className="bg-sky-50/50 border-sky-200/80">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block">
              মোট ট্রে গণনা
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-950">
                {toBengaliNumber(Math.floor((inv.goodPieces || 0) / traySize))}
              </span>
              <span className="text-sm text-sky-700">ট্রে</span>
            </div>
            <div className="mt-2 pt-2 border-t border-sky-200/60 text-xs text-sky-700">
              ১ ট্রে = {toBengaliNumber(traySize)}টি ডিম নির্ধারিত
            </div>
          </Card>

          {/* Card 3: Broken / Damaged */}
          <Card className="bg-rose-50/50 border-rose-200/80">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
              ভাঙা / ফাটা ডিম
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-950">
                {toBengaliNumber(inv.brokenPieces || 0)}
              </span>
              <span className="text-sm text-rose-700">টি</span>
            </div>
            <div className="mt-2 pt-2 border-t border-rose-200/60 text-xs text-rose-700">
              ক্ষতির বিবরণী অন্তর্ভুক্ত
            </div>
          </Card>

          {/* Card 4: Dirty / Soft Shell */}
          <Card className="bg-amber-50/50 border-amber-200/80">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
              ময়লা / নরম খোসার ডিম
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950">
                {toBengaliNumber(inv.dirtyPieces || 0)}
              </span>
              <span className="text-sm text-amber-700">টি</span>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200/60 text-xs text-amber-700">
              কম মূল্যে বা প্রক্রিয়াজাত বিক্রয়যোগ্য
            </div>
          </Card>
        </div>

        {/* Production History Table */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>ডিম উৎপাদন ও সংগ্রহ ইতিহাস</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                প্রতিদিনের মোট সংগ্রহ, গ্রেড ও উৎপাদনের শতকরা হার
              </p>
            </div>
            <span className="text-xs text-slate-500">
              মোট রেকর্ড: {toBengaliNumber(productionEntries.length)} দিন
            </span>
          </CardHeader>

          {loading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : productionEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              এখনো কোনো উৎপাদন রেকর্ড সংরক্ষণ করা হয়নি
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">ফ্লক / ব্যাচ</th>
                    <th className="py-3 px-4">মোট ডিম</th>
                    <th className="py-3 px-4">ভালো ডিম</th>
                    <th className="py-3 px-4">ভাঙা ডিম</th>
                    <th className="py-3 px-4">ময়লা ডিম</th>
                    <th className="py-3 px-4">উৎপাদন হার</th>
                    <th className="py-3 px-4">এন্ট্রি প্রদানকারী</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productionEntries.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {formatBengaliDate(entry.date)}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {entry.flockId?.name || 'ফ্লক'}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-emerald-800">
                        {toBengaliNumber(entry.totalEggs)} টি
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700 font-medium">
                        {toBengaliNumber(entry.goodEggs)} টি
                      </td>
                      <td className="py-3 px-4 text-xs text-rose-600">
                        {toBengaliNumber(entry.brokenEggs)} টি
                      </td>
                      <td className="py-3 px-4 text-xs text-amber-600">
                        {toBengaliNumber(entry.dirtyEggs)} টি
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-emerald-700">
                        {toBengaliNumber(entry.eggProductionPercentage)}%
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {entry.recordedByName || 'স্টাফ'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="ডিম স্টক সমন্বয় (Stock Adjustment)"
      >
        <form onSubmit={handleAdjustStock} className="space-y-4">
          <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <strong>সতর্কতা:</strong> স্টক সমন্বয় কেবল ফিজিক্যাল গণনা বা কোনো অপ্রত্যাশিত নষ্ট/ক্ষতির
            প্রেক্ষিতে করা উচিত। প্রতিটি সমন্বয় অডিট লগে রেকর্ড হয়।
          </p>

          <Input
            label="ভালো ডিমের নতুন সংখ্যা (পিস)"
            type="number"
            min="0"
            value={adjustForm.goodPieces}
            onChange={(e) => setAdjustForm({ ...adjustForm, goodPieces: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="ভাঙা ডিম (পিস)"
              type="number"
              min="0"
              value={adjustForm.brokenPieces}
              onChange={(e) => setAdjustForm({ ...adjustForm, brokenPieces: e.target.value })}
            />
            <Input
              label="ময়লা ডিম (পিস)"
              type="number"
              min="0"
              value={adjustForm.dirtyPieces}
              onChange={(e) => setAdjustForm({ ...adjustForm, dirtyPieces: e.target.value })}
            />
          </div>

          <Input
            label="সমন্বয়ের সুনির্দিষ্ট কারণ"
            placeholder="যেমন: মাসিক ফিজিক্যাল অডিট বা পরিবহন জনিত অতিরিক্ত ভাঙা"
            value={adjustForm.reason}
            onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAdjustModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              সমন্বয় সম্পন্ন করুন
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
