'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatTaka } from '@/lib/utils';
import {
  Calculator,
  PieChart,
  Egg,
  TrendingUp,
  TrendingDown,
  Wheat,
  Syringe,
  Zap,
  Users,
} from 'lucide-react';
import { IUser } from '@/types';

export default function CostAnalysisPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCostData = async (targetMonth: string) => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch(`/api/finance/cost-analysis?month=${targetMonth}`).then((r) =>
          r.ok ? r.json() : null
        ),
      ]);
      if (uRes?.user) setUser(uRes.user);
      if (cRes) setData(cRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData(month);
  }, [month]);

  const costs = data?.costs || {};
  const analysis = data?.analysis || {};
  const production = data?.production || {};
  const traySize = data?.traySize || 30;

  const totalCost = costs.totalOperatingCost || 0;
  const feedPercent = totalCost > 0 ? Math.round((costs.feedCost / totalCost) * 100) : 0;
  const medPercent = totalCost > 0 ? Math.round((costs.medicineCost / totalCost) * 100) : 0;
  const utilPercent = totalCost > 0 ? Math.round((costs.utilityCost / totalCost) * 100) : 0;
  const labourPercent = totalCost > 0 ? Math.round((costs.labourCost / totalCost) * 100) : 0;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                ডিম উৎপাদন খরচ ও লাভ বিশ্লেষণ (Cost of Production)
              </h2>
              <Badge variant="emerald">বৈজ্ঞানিক আর্থিক মডেল</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              খাদ্য, ওষুধ, বিদ্যুৎ ও মজুরির ভিত্তিতে প্রতিটি ডিম ও প্রতি ট্রে ডিমের প্রকৃত উৎপাদন খরচ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">মাস নির্বাচন:</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 3 Core Highlight KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Cost per Egg */}
          <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-emerald-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              প্রতিটি ডিমের উৎপাদন খরচ
            </span>
            <div className="mt-2 text-3xl font-black text-emerald-900">
              {formatTaka(analysis.costPerEgg || 0)}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>গড় বিক্রয়মূল্য: {formatTaka(analysis.avgSellingPricePerEgg || 0)}</span>
              <span
                className={`font-bold ${
                  (analysis.netMarginPerEgg || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                মার্জিন: {formatTaka(analysis.netMarginPerEgg || 0)}
              </span>
            </div>
          </Card>

          {/* Card 2: Cost per Tray */}
          <Card className="bg-gradient-to-br from-white to-sky-50/30 border-sky-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              প্রতি ট্রে ডিমের উৎপাদন খরচ ({toBengaliNumber(traySize)}টি ডিম)
            </span>
            <div className="mt-2 text-3xl font-black text-sky-950">
              {formatTaka(analysis.costPerTray || 0)}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>গড় বিক্রয়মূল্য: {formatTaka(analysis.avgSellingPricePerTray || 0)}</span>
              <span
                className={`font-bold ${
                  (analysis.netMarginPerTray || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                মার্জিন: {formatTaka(analysis.netMarginPerTray || 0)}
              </span>
            </div>
          </Card>

          {/* Card 3: Total Monthly Egg Output & Operating Cost */}
          <Card className="bg-gradient-to-br from-white to-amber-50/30 border-amber-200">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              মাসে মোট সংগৃহীত ডিম
            </span>
            <div className="mt-2 text-3xl font-black text-amber-950">
              {toBengaliNumber(production.totalEggsProduced || 0)}{' '}
              <span className="text-sm font-normal text-slate-500">টি</span>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span>মোট খরচ: {formatTaka(costs.totalOperatingCost || 0)}</span>
              <span>ব্যবহৃত খাদ্য: {toBengaliNumber(production.totalFeedKgUsed || 0)} কেজি</span>
            </div>
          </Card>
        </div>

        {/* Cost Breakdown Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>খরচের প্রধান খাতসমূহ ও অনুপাত</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  লেয়ার পোল্ট্রি ফার্মে খাদ্য সাধারণত মোট খরচের ৭০%–৭৫% স্থান দখল করে
                </p>
              </div>
              <PieChart className="w-5 h-5 text-emerald-700" />
            </CardHeader>

            <div className="space-y-4 pt-2">
              {/* Feed Cost */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Wheat className="w-4 h-4 text-amber-600" />
                    পোল্ট্রি খাদ্য খরচ (Feed):
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatTaka(costs.feedCost || 0)} ({toBengaliNumber(feedPercent)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${feedPercent}%` }}
                  />
                </div>
              </div>

              {/* Medicine & Vaccine */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Syringe className="w-4 h-4 text-rose-600" />
                    ওষুধ ও ভ্যাকসিন খরচ (Medicine):
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatTaka(costs.medicineCost || 0)} ({toBengaliNumber(medPercent)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{ width: `${medPercent}%` }}
                  />
                </div>
              </div>

              {/* Electricity & Utilities */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-sky-600" />
                    বিদ্যুৎ ও ইউটিলিটি খরচ:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatTaka(costs.utilityCost || 0)} ({toBengaliNumber(utilPercent)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all"
                    style={{ width: `${utilPercent}%` }}
                  />
                </div>
              </div>

              {/* Labour & Salary */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    কর্মীদের বেতন ও মজুরি:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatTaka(costs.labourCost || 0)} ({toBengaliNumber(labourPercent)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${labourPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Formulas and Summary Table */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>হিসাব পদ্ধতি ও বৈজ্ঞানিক সূত্রাবলী</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">স্বচ্ছ ও আন্তর্জাতিক পোল্ট্রি মানদণ্ড</p>
              </div>
              <Calculator className="w-5 h-5 text-slate-600" />
            </CardHeader>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>প্রতিটি ডিমের উৎপাদন খরচ:</strong>
                <p className="font-mono text-emerald-800 mt-0.5">
                  Cost per Egg = (মোট অপারেটিং ব্যয় ÷ মোট ডিম উৎপাদন)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>ট্রে প্রতি খরচ:</strong>
                <p className="font-mono text-sky-800 mt-0.5">
                  Cost per Tray = প্রতিটি ডিমের উৎপাদন খরচ × {toBengaliNumber(traySize)}টি
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>নেট প্রফিট মার্জিন:</strong>
                <p className="font-mono text-slate-800 mt-0.5">
                  Profit Margin = ডিম বিক্রয়ের গড় মূল্য – ডিম উৎপাদন খরচ
                </p>
              </div>

              <div className="mt-4 p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 text-xs font-medium">
                💡 <strong>পরামর্শ:</strong> খাদ্যের অপচয় রোধ এবং খাদ্য রূপান্তর অনুপাত (FCR)
                উন্নয়ন করলে ডিম প্রতি উৎপাদন খরচ ৫০ থেকে ৮০ পয়সা পর্যন্ত কমানো সম্ভব।
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
