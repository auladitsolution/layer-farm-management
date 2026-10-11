'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  toBengaliNumber,
  formatTaka,
  formatBengaliDate,
} from '@/lib/utils';
import {
  Egg,
  Wheat,
  Activity,
  Layers,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  TrendingDown,
  Warehouse,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { IUser } from '@/types';

// Custom rich chart tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/60 text-xs space-y-1.5">
        <p className="font-semibold text-slate-300 border-b border-slate-700/60 pb-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          <span>{label}</span>
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">
              {toBengaliNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Fetch current user and dashboard data
    Promise.all([
      fetch('/api/auth/me').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/dashboard').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([userData, dashData]) => {
        if (userData?.user) setUser(userData.user);
        if (dashData) setData(dashData);
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const overview = data?.overview || {};
  const finance = data?.finance || {};
  const chartData = data?.chartData || [];
  const notifications = data?.notifications || [];
  const farmName = data?.settings?.farmName || 'বিসমিল্লাহ লেয়ার ফার্ম';

  return (
    <DashboardLayout user={user} farmName={farmName}>
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white/80 p-5 md:p-6 rounded-2xl border border-emerald-500/20 shadow-xs backdrop-blur-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {farmName}
              </h2>
              <Badge variant="emerald" dot>
                সক্রিয় খামার
              </Badge>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium flex items-center gap-2">
              <span>আজ {formatBengaliDate(new Date())}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">বাণিজ্যিক লেয়ার ড্যাশবোর্ড</span>
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-2.5">
            <Link href="/daily-entry">
              <Button
                variant="primary"
                size="md"
                icon={<PlusCircle className="w-4 h-4" />}
              >
                আজকের দৈনিক এন্ট্রি
              </Button>
            </Link>
            <Link href="/sales">
              <Button
                variant="outline"
                size="md"
                icon={<ArrowUpRight className="w-4 h-4" />}
              >
                ডিম বিক্রয় চালান
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Alerts Banner */}
        {notifications.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">সতর্কবার্তা ও বিজ্ঞপ্তি:</h4>
              <div className="mt-1 space-y-1.5 text-xs text-amber-800">
                {notifications.map((n: any, idx: number) => (
                  <p key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>
                      <strong className="font-semibold">{n.title}:</strong> {n.message}
                    </span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Primary Farm Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Birds */}
          <Card className="card-hover-effect stat-glow-emerald border-emerald-500/20 bg-gradient-to-br from-white via-white to-emerald-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                বর্তমান মোট মুরগি
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-2xs">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {toBengaliNumber(overview.totalBirds || 0)}{' '}
                  <span className="text-sm font-semibold text-slate-500">টি</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{toBengaliNumber(overview.totalSheds || 0)}টি শেড</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{toBengaliNumber(overview.activeBatches || 0)}টি সক্রিয় ব্যাচ</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Today's Egg Production */}
          <Card className="card-hover-effect stat-glow-sky border-sky-500/20 bg-gradient-to-br from-white via-white to-sky-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                আজকের ডিম উৎপাদন
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center ring-1 ring-sky-500/20 shadow-2xs">
                <Egg className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {toBengaliNumber(overview.todayEggs || 0)}{' '}
                  <span className="text-sm font-semibold text-slate-500">টি</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  ভালো: {toBengaliNumber(overview.todayGoodEggs || 0)}
                </span>
                <span className="text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60">
                  ভাঙা: {toBengaliNumber(overview.todayBrokenEggs || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 3: Today's Feed & Stock */}
          <Card className="card-hover-effect stat-glow-amber border-amber-500/20 bg-gradient-to-br from-white via-white to-amber-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                খাদ্য ব্যবহার ও স্টক
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center ring-1 ring-amber-500/20 shadow-2xs">
                <Wheat className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {toBengaliNumber(overview.todayFeedKg || 0)}{' '}
                  <span className="text-sm font-semibold text-slate-500">কেজি আজ</span>
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500">
                বর্তমান স্টক:{' '}
                <span className="font-bold text-slate-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  {toBengaliNumber(overview.currentFeedStockKg || 0)} কেজি
                </span>
              </div>
            </div>
          </Card>

          {/* Card 4: Current Egg Stock */}
          <Card className="card-hover-effect stat-glow-indigo border-indigo-500/20 bg-gradient-to-br from-white via-white to-indigo-50/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                বর্তমান ডিমের স্টক
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-500/20 shadow-2xs">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {toBengaliNumber(overview.currentEggStock || 0)}{' '}
                  <span className="text-sm font-semibold text-slate-500">টি</span>
                </div>
              )}
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                <span>ট্রে:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  {toBengaliNumber(
                    Math.floor((overview.currentEggStock || 0) / (data?.settings?.traySize || 30))
                  )}{' '}
                  ট্রে
                </span>
                <span className="text-[11px] text-slate-400">({toBengaliNumber(data?.settings?.traySize || 30)}টি/ট্রে)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Financial Highlights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Today's Financial Movement */}
          <Card className="card-hover-effect">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">আজকের অর্থনৈতিক চিত্র</span>
              </div>
              <Badge variant="emerald">দৈনিক</Badge>
            </div>
            <div className="mt-3.5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/40 border border-emerald-100/60">
                <span className="text-slate-600 text-xs font-medium">আজকের বিক্রয়:</span>
                <span className="font-bold text-emerald-700">
                  {formatTaka(finance.todaySales || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/40 border border-rose-100/60">
                <span className="text-slate-600 text-xs font-medium">আজকের খরচ:</span>
                <span className="font-bold text-rose-600">
                  {formatTaka(finance.todayExpenses || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Monthly Profit / Loss */}
          <Card className="card-hover-effect">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                  {(finance.estimatedProfit || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-700">চলতি মাসের আয়-ব্যয়</span>
              </div>
              <Badge variant={(finance.estimatedProfit || 0) >= 0 ? 'emerald' : 'rose'}>
                {(finance.estimatedProfit || 0) >= 0 ? 'লাভজনক' : 'ঘাটতি'}
              </Badge>
            </div>
            <div className="mt-3.5 space-y-2 text-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">মোট আয়:</span>
                <span className="font-bold text-slate-800">
                  {formatTaka(finance.monthlyIncome || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">মোট খরচ:</span>
                <span className="font-bold text-slate-800">
                  {formatTaka(finance.monthlyExpense || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">আনুমানিক ফলাফল:</span>
                <Badge variant={(finance.estimatedProfit || 0) >= 0 ? 'emerald' : 'rose'} dot>
                  {(finance.estimatedProfit || 0) >= 0 ? 'লাভ: ' : 'ক্ষতি: '}
                  {formatTaka(Math.abs(finance.estimatedProfit || 0))}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Card 3: Receivables & Payables */}
          <Card className="card-hover-effect">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">বকেয়া ও দেনা-পাওনা</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">বর্তমান স্থিতি</span>
            </div>
            <div className="mt-3.5 space-y-2.5 text-sm">
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/40 border border-amber-100/60">
                <span className="text-slate-600 text-xs font-medium">কাস্টমার বকেয়া:</span>
                <span className="font-bold text-amber-800">
                  {formatTaka(finance.customerReceivables || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-slate-600 text-xs font-medium">সরবরাহকারীকে দেনা:</span>
                <span className="font-bold text-slate-800">
                  {formatTaka(finance.supplierPayables || 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section: 7-Day Egg Production & Feed Consumption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Egg Production Trend */}
          <Card className="card-hover-effect">
            <CardHeader>
              <div>
                <CardTitle>গত ৭ দিনের ডিম উৎপাদন প্রবণতা</CardTitle>
                <CardDescription>প্রতিদিনের মোট সংগৃহীত ডিমের সংখ্যা (পিস)</CardDescription>
              </div>
              <Badge variant="emerald">দৈনিক ট্রেন্ড</Badge>
            </CardHeader>
            <div className="h-72 w-full pt-2">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  চার্ট তৈরির মতো পর্যাপ্ত তথ্য এখনো রেকর্ড করা হয়নি
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eggColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="eggs"
                      name="ডিম উৎপাদন"
                      stroke="#059669"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#eggColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Chart 2: Feed & Mortality */}
          <Card className="card-hover-effect">
            <CardHeader>
              <div>
                <CardTitle>খাদ্য ব্যবহার ও মৃত্যুহার চিত্র</CardTitle>
                <CardDescription>৭ দিনের খাদ্য গ্রহণ (কেজি) ও মৃত্যু সংখ্যা (টি)</CardDescription>
              </div>
              <Badge variant="amber">পুষ্টি ও স্বাস্থ্য</Badge>
            </CardHeader>
            <div className="h-72 w-full pt-2">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  চার্ট তৈরির মতো পর্যাপ্ত তথ্য এখনো রেকর্ড করা হয়নি
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="feedKg" name="খাদ্য (কেজি)" fill="#d97706" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="mortality" name="মৃত্যু (টি)" fill="#e11d48" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

