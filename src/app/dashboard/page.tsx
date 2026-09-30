'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
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
  const farmName = data?.settings?.farmName || 'আওলাদ এগ্রো অ্যান্ড পোল্ট্রি ফার্ম';

  return (
    <DashboardLayout user={user} farmName={farmName}>
      <div className="space-y-6">
        {/* Top Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                {farmName}
              </h2>
              <Badge variant="emerald">সক্রিয় খামার</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              আজ {formatBengaliDate(new Date())} • লেয়ার পোল্ট্রি খামার ওভারভিউ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/daily-entry">
              <Button
                variant="primary"
                size="md"
                className="shadow-sm"
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">সতর্কবার্তা ও বিজ্ঞপ্তি:</h4>
              <div className="mt-1 space-y-1 text-xs text-amber-700">
                {notifications.map((n: any, idx: number) => (
                  <p key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>
                      <strong>{n.title}:</strong> {n.message}
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
          <Card className="border-emerald-100/80 bg-gradient-to-br from-white to-emerald-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                বর্তমান মোট মুরগি
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">
                  {toBengaliNumber(overview.totalBirds || 0)}{' '}
                  <span className="text-sm font-normal text-slate-500">টি</span>
                </div>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>{toBengaliNumber(overview.totalSheds || 0)}টি শেড</span>
                <span>•</span>
                <span>{toBengaliNumber(overview.activeBatches || 0)}টি সক্রিয় ব্যাচ</span>
              </div>
            </div>
          </Card>

          {/* Card 2: Today's Egg Production */}
          <Card className="border-sky-100/80 bg-gradient-to-br from-white to-sky-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                আজকের ডিম উৎপাদন
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Egg className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">
                  {toBengaliNumber(overview.todayEggs || 0)}{' '}
                  <span className="text-sm font-normal text-slate-500">টি</span>
                </div>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span className="text-emerald-600 font-medium">
                  ভালো: {toBengaliNumber(overview.todayGoodEggs || 0)}
                </span>
                <span>•</span>
                <span className="text-rose-500">
                  ভাঙা/নষ্ট: {toBengaliNumber(overview.todayBrokenEggs || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 3: Today's Feed & Stock */}
          <Card className="border-amber-100/80 bg-gradient-to-br from-white to-amber-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                খাদ্য ব্যবহার ও স্টক
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Wheat className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">
                  {toBengaliNumber(overview.todayFeedKg || 0)}{' '}
                  <span className="text-sm font-normal text-slate-500">কেজি আজ</span>
                </div>
              )}
              <div className="mt-1 text-xs text-slate-500">
                বর্তমান স্টক:{' '}
                <span className="font-semibold text-slate-700">
                  {toBengaliNumber(overview.currentFeedStockKg || 0)} কেজি
                </span>
              </div>
            </div>
          </Card>

          {/* Card 4: Current Egg Stock */}
          <Card className="border-indigo-100/80 bg-gradient-to-br from-white to-indigo-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                বর্তমান ডিমের স্টক
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Warehouse className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-slate-800">
                  {toBengaliNumber(overview.currentEggStock || 0)}{' '}
                  <span className="text-sm font-normal text-slate-500">টি</span>
                </div>
              )}
              <div className="mt-1 text-xs text-slate-500">
                ট্রে হিসেবে:{' '}
                <span className="font-semibold text-slate-700">
                  {toBengaliNumber(
                    Math.floor((overview.currentEggStock || 0) / (data?.settings?.traySize || 30))
                  )}{' '}
                  ট্রে
                </span>{' '}
                ({toBengaliNumber(data?.settings?.traySize || 30)}টি/ট্রে)
              </div>
            </div>
          </Card>
        </div>

        {/* Financial Highlights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Today's Financial Movement */}
          <Card>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-600">আজকের অর্থনৈতিক চিত্র</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">আজকের বিক্রয়:</span>
                <span className="font-semibold text-emerald-700">
                  {formatTaka(finance.todaySales || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">আজকের খরচ:</span>
                <span className="font-semibold text-rose-600">
                  {formatTaka(finance.todayExpenses || 0)}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Monthly Profit / Loss */}
          <Card>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-600">চলতি মাসের আয়-ব্যয়</span>
              {(finance.estimatedProfit || 0) >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              )}
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">মোট আয়:</span>
                <span className="font-semibold text-slate-800">
                  {formatTaka(finance.monthlyIncome || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">মোট খরচ:</span>
                <span className="font-semibold text-slate-800">
                  {formatTaka(finance.monthlyExpense || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-600">আনুমানিক ফলাফল:</span>
                <Badge variant={(finance.estimatedProfit || 0) >= 0 ? 'emerald' : 'rose'}>
                  {(finance.estimatedProfit || 0) >= 0 ? 'লাভ: ' : 'ক্ষতি: '}
                  {formatTaka(Math.abs(finance.estimatedProfit || 0))}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Card 3: Receivables & Payables */}
          <Card>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-600">বকেয়া ও দেনা-পাওনা</span>
              <span className="text-xs text-slate-400">বর্তমান স্থিতি</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ক্রেতার কাছে বকেয়া:</span>
                <span className="font-bold text-amber-700">
                  {formatTaka(finance.customerReceivables || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">সরবরাহকারীকে দেনা:</span>
                <span className="font-bold text-rose-700">
                  {formatTaka(finance.supplierPayables || 0)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section: 7-Day Egg Production & Feed Consumption */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Egg Production Trend */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>গত ৭ দিনের ডিম উৎপাদন প্রবণতা</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">প্রতিদিনের মোট সংগৃহীত ডিম (পিস)</p>
              </div>
              <Badge variant="emerald">দৈনিক উৎপাদন</Badge>
            </CardHeader>
            <div className="h-72 w-full pt-4">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  চার্ট তৈরির মতো পর্যাপ্ত তথ্য এখনো রেকর্ড করা হয়নি
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eggColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${toBengaliNumber(val)} টি`, 'ডিম']}
                      labelFormatter={(label) => `তারিখ: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="eggs"
                      name="ডিম উৎপাদন"
                      stroke="#059669"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#eggColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Chart 2: Feed & Mortality */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>খাদ্য ব্যবহার ও মৃত্যুহার চিত্র</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">৭ দিনের খাদ্য গ্রহণ (কেজি) ও মৃত্যু সংখ্যা</p>
              </div>
              <Badge variant="amber">স্বাস্থ্য ও পুষ্টি</Badge>
            </CardHeader>
            <div className="h-72 w-full pt-4">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  চার্ট তৈরির মতো পর্যাপ্ত তথ্য এখনো রেকর্ড করা হয়নি
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${toBengaliNumber(val)} ${name === 'খাদ্য (কেজি)' ? 'কেজি' : 'টি'}`,
                        name,
                      ]}
                      labelFormatter={(label) => `তারিখ: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="feedKg" name="খাদ্য (কেজি)" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="mortality" name="মৃত্যু (টি)" fill="#e11d48" radius={[4, 4, 0, 0]} />
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
