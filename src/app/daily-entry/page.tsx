'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  toBengaliNumber,
  formatBengaliDate,
  calculateHenDayProduction,
  calculateFeedPerBird,
  calculateMortalityRate,
} from '@/lib/utils';
import {
  Egg,
  Wheat,
  Activity,
  CheckCircle,
  AlertCircle,
  Calendar,
  Save,
  Layers,
  Thermometer,
} from 'lucide-react';
import { IUser } from '@/types';

export default function DailyEntryPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [flocks, setFlocks] = useState<any[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFlockId, setSelectedFlockId] = useState('');
  const [selectedFeedItemId, setSelectedFeedItemId] = useState('');
  const [totalEggs, setTotalEggs] = useState('');
  const [goodEggs, setGoodEggs] = useState('');
  const [brokenEggs, setBrokenEggs] = useState('');
  const [dirtyEggs, setDirtyEggs] = useState('');
  const [feedConsumedKg, setFeedConsumedKg] = useState('');
  const [waterLiters, setWaterLiters] = useState('');
  const [mortalityCount, setMortalityCount] = useState('');
  const [culledCount, setCulledCount] = useState('');
  const [temperatureCelsius, setTemperatureCelsius] = useState('');
  const [notes, setNotes] = useState('');

  const fetchInitialData = async () => {
    try {
      const [uRes, fRes, feedRes, entriesRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/flocks?status=ACTIVE').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/feed').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/daily-entry?limit=15').then((r) => (r.ok ? r.json() : [])),
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(fRes)) {
        setFlocks(fRes);
        if (fRes.length > 0) setSelectedFlockId(fRes[0]._id);
      }
      if (Array.isArray(feedRes)) {
        setFeedItems(feedRes);
        if (feedRes.length > 0) setSelectedFeedItemId(feedRes[0]._id);
      }
      if (Array.isArray(entriesRes)) setRecentEntries(entriesRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const selectedFlock = flocks.find((f) => f._id === selectedFlockId);
  const openingBirds = selectedFlock ? selectedFlock.currentBirdCount : 0;

  // Real-time calculation indicators
  const numTotalEggs = Number(totalEggs) || 0;
  const numGoodEggs = Number(goodEggs) || 0;
  const numBroken = Number(brokenEggs) || 0;
  const numDirty = Number(dirtyEggs) || 0;
  const numFeed = Number(feedConsumedKg) || 0;
  const numMortality = Number(mortalityCount) || 0;
  const numCulled = Number(culledCount) || 0;

  const closingBirds = Math.max(0, openingBirds - numMortality - numCulled);
  const henDayPercent = calculateHenDayProduction(numTotalEggs, openingBirds);
  const feedPerBird = calculateFeedPerBird(numFeed, openingBirds);
  const mortalityPercent = calculateMortalityRate(numMortality, openingBirds);

  // Auto-sync good eggs if total eggs typed and good eggs is empty
  const handleTotalEggsChange = (val: string) => {
    setTotalEggs(val);
    const numVal = Number(val) || 0;
    const broken = Number(brokenEggs) || 0;
    const dirty = Number(dirtyEggs) || 0;
    setGoodEggs(String(Math.max(0, numVal - broken - dirty)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlockId) {
      setFeedback({ type: 'error', message: 'অনুগ্রহ করে একটি ফ্লক/ব্যাচ নির্বাচন করুন' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/daily-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          flockId: selectedFlockId,
          totalEggs: numTotalEggs,
          goodEggs: numGoodEggs || numTotalEggs - numBroken - numDirty,
          brokenEggs: numBroken,
          dirtyEggs: numDirty,
          feedConsumedKg: numFeed,
          waterLiters: Number(waterLiters) || 0,
          mortalityCount: numMortality,
          culledCount: numCulled,
          feedItemId: selectedFeedItemId,
          temperatureCelsius: temperatureCelsius ? Number(temperatureCelsius) : undefined,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'এন্ট্রি সংরক্ষণ ব্যর্থ হয়েছে');

      setFeedback({
        type: 'success',
        message: 'দৈনিক এন্ট্রি সফলভাবে সম্পন্ন হয়েছে এবং ডিম ও খাদ্য স্টক আপডেট হয়েছে!',
      });

      // Clear input form
      setTotalEggs('');
      setGoodEggs('');
      setBrokenEggs('');
      setDirtyEggs('');
      setFeedConsumedKg('');
      setWaterLiters('');
      setMortalityCount('');
      setCulledCount('');
      setNotes('');

      fetchInitialData();
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
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                দৈনিক খামার এন্ট্রি (Daily Farm Entry)
              </h2>
              <Badge variant="emerald">দ্রুত ইনপুট</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ডিম উৎপাদন, খাদ্য ব্যবহার, মৃত্যুসংখ্যা ও বৈজ্ঞানিক কর্মক্ষমতা পরিমাপক
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>{formatBengaliDate(date)}</span>
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

        {/* Real-time Indicator Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 bg-emerald-50/40 border-emerald-200/60">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
              হেন-ডে উৎপাদন হার
            </span>
            <div className="text-xl md:text-2xl font-black text-emerald-900 mt-1">
              {toBengaliNumber(henDayPercent)}%
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              (মোট ডিম ÷ বর্তমান মুরগি) × ১০০
            </span>
          </Card>

          <Card className="p-4 bg-amber-50/40 border-amber-200/60">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
              প্রতি মুরগির খাদ্য
            </span>
            <div className="text-xl md:text-2xl font-black text-amber-900 mt-1">
              {toBengaliNumber(feedPerBird)}{' '}
              <span className="text-xs font-normal text-amber-700">গ্রাম</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              আদর্শ মাত্রা: ১১০-১২০ গ্রাম
            </span>
          </Card>

          <Card className="p-4 bg-rose-50/40 border-rose-200/60">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
              দৈনিক মৃত্যুহার
            </span>
            <div className="text-xl md:text-2xl font-black text-rose-900 mt-1">
              {toBengaliNumber(mortalityPercent)}%
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              সতর্কসীমা: ১.৫% এর নিচে
            </span>
          </Card>

          <Card className="p-4 bg-slate-50 border-slate-200">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
              সমাপনী মুরগি সংখ্যা
            </span>
            <div className="text-xl md:text-2xl font-black text-slate-800 mt-1">
              {toBengaliNumber(closingBirds)}{' '}
              <span className="text-xs font-normal text-slate-500">টি</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              প্রারম্ভিক: {toBengaliNumber(openingBirds)} টি
            </span>
          </Card>
        </div>

        {/* Main Entry Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border-emerald-200/70">
            <CardHeader>
              <div>
                <CardTitle>আজকের তথ্য ইনপুট ফরম</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  নির্ভুল তথ্যের জন্য শেড থেকে সংগৃহীত সঠিক সংখ্যা প্রবেশ করান
                </p>
              </div>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                স্বয়ংক্রিয় স্টক সমন্বয়
              </span>
            </CardHeader>

            <div className="space-y-6">
              {/* Section 1: Flock and Date Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <Input
                  label="তারিখ"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />

                <Select
                  label="ফ্লক / ব্যাচ নির্বাচন করুন"
                  value={selectedFlockId}
                  onChange={(e) => setSelectedFlockId(e.target.value)}
                  required
                >
                  <option value="">-- ফ্লক নির্বাচন করুন --</option>
                  {flocks.map((flock) => (
                    <option key={flock._id} value={flock._id}>
                      {flock.name} ({flock.batchId}) - বর্তমান মুরগি: {flock.currentBirdCount}টি
                    </option>
                  ))}
                </Select>

                <div className="flex flex-col justify-center">
                  <span className="text-xs font-medium text-slate-500">নির্বাচিত ব্যাচ তথ্য</span>
                  <div className="text-sm font-semibold text-slate-800 mt-1">
                    {selectedFlock ? (
                      <span className="text-emerald-700">
                        {selectedFlock.name} (শেড: {selectedFlock.shedName || 'শেড ১'})
                      </span>
                    ) : (
                      'কোনো ফ্লক নির্বাচিত হয়নি'
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    আজকের প্রারম্ভিক মুরগি:{' '}
                    <strong>{toBengaliNumber(openingBirds)}</strong> টি
                  </div>
                </div>
              </div>

              {/* Section 2: Egg Production Breakdown */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Egg className="w-4 h-4 text-emerald-700" />
                  ডিম উৎপাদনের হিসাব (Egg Production)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="মোট ডিম সংগৃহীত (পিস)"
                    type="number"
                    min="0"
                    placeholder="যেমন: ২৫০০"
                    value={totalEggs}
                    onChange={(e) => handleTotalEggsChange(e.target.value)}
                    required
                  />

                  <Input
                    label="ভালো ডিম (পিস)"
                    type="number"
                    min="0"
                    placeholder="যেমন: ২৪৫০"
                    value={goodEggs}
                    onChange={(e) => setGoodEggs(e.target.value)}
                    required
                  />

                  <Input
                    label="ভাঙা / ফাটা ডিম"
                    type="number"
                    min="0"
                    placeholder="যেমন: ৩০"
                    value={brokenEggs}
                    onChange={(e) => {
                      setBrokenEggs(e.target.value);
                      const tot = Number(totalEggs) || 0;
                      const brk = Number(e.target.value) || 0;
                      const drt = Number(dirtyEggs) || 0;
                      setGoodEggs(String(Math.max(0, tot - brk - drt)));
                    }}
                  />

                  <Input
                    label="ময়লা / নরম খোসার ডিম"
                    type="number"
                    min="0"
                    placeholder="যেমন: ২০"
                    value={dirtyEggs}
                    onChange={(e) => {
                      setDirtyEggs(e.target.value);
                      const tot = Number(totalEggs) || 0;
                      const brk = Number(brokenEggs) || 0;
                      const drt = Number(e.target.value) || 0;
                      setGoodEggs(String(Math.max(0, tot - brk - drt)));
                    }}
                  />
                </div>
              </div>

              {/* Section 3: Feed, Water & Health */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Wheat className="w-4 h-4 text-amber-700" />
                  খাদ্য, পানি ও মুরগির স্বাস্থ্য
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="খাদ্য ব্যবহার (কেজি)"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="যেমন: ৩৫০"
                    value={feedConsumedKg}
                    onChange={(e) => setFeedConsumedKg(e.target.value)}
                    required
                  />

                  <Select
                    label="খাদ্যের ধরন / আইটেম"
                    value={selectedFeedItemId}
                    onChange={(e) => setSelectedFeedItemId(e.target.value)}
                  >
                    <option value="">-- খাদ্য নির্বাচন করুন --</option>
                    {feedItems.map((feed) => (
                      <option key={feed._id} value={feed._id}>
                        {feed.name} (মজুদ: {feed.currentStockKg} কেজি)
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="মৃত্যু সংখ্যা (আজকে মৃত মুরগি)"
                    type="number"
                    min="0"
                    placeholder="যেমন: ৫"
                    value={mortalityCount}
                    onChange={(e) => setMortalityCount(e.target.value)}
                  />

                  <Input
                    label="বাতিল / বিক্রি করা মুরগি"
                    type="number"
                    min="0"
                    placeholder="যেমন: ০"
                    value={culledCount}
                    onChange={(e) => setCulledCount(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="পানি ব্যবহার (লিটার - ঐচ্ছিক)"
                    type="number"
                    placeholder="যেমন: ৬০০"
                    value={waterLiters}
                    onChange={(e) => setWaterLiters(e.target.value)}
                  />

                  <Input
                    label="শেডের তাপমাত্রা (°C - ঐচ্ছিক)"
                    type="number"
                    step="0.1"
                    placeholder="যেমন: ২৮.৫"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <Input
                label="মন্তব্য / বিশেষ স্বাস্থ্য পর্যবেক্ষণ"
                placeholder="যেমন: মুরগির ডাক স্বাভাবিক, ভ্যাকসিনের পর প্রতিক্রিয়া ভালো"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={submitting}
                  icon={<Save className="w-5 h-5" />}
                  className="w-full sm:w-auto px-8"
                >
                  দৈনিক এন্ট্রি সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </Card>
        </form>

        {/* Recent Daily Entries Table */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>সাম্প্রতিক দৈনিক এন্ট্রি রেকর্ড</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">বিগত ১৫ দিনের সংরক্ষিত তথ্য</p>
            </div>
          </CardHeader>

          {loading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              এখনো কোনো দৈনিক এন্ট্রি পাওয়া যায়নি
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">ফ্লক</th>
                    <th className="py-3 px-4">মোট ডিম</th>
                    <th className="py-3 px-4">ভালো ডিম</th>
                    <th className="py-3 px-4">উৎপাদন %</th>
                    <th className="py-3 px-4">খাদ্য (কেজি)</th>
                    <th className="py-3 px-4">মৃত্যু</th>
                    <th className="py-3 px-4">সমাপনী মুরগি</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEntries.map((entry) => (
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
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {toBengaliNumber(entry.goodEggs)} টি
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-emerald-700">
                        {toBengaliNumber(entry.eggProductionPercentage)}%
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {toBengaliNumber(entry.feedConsumedKg)} কেজি
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-rose-600">
                        {toBengaliNumber(entry.mortalityCount)} টি
                      </td>
                      <td className="py-3 px-4 text-xs font-bold text-slate-900">
                        {toBengaliNumber(entry.closingBirdCount)} টি
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
