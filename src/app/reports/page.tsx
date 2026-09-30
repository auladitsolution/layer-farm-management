'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatTaka, formatBengaliDate } from '@/lib/utils';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  Egg,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { IUser } from '@/types';

export default function ReportsPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [reportType, setReportType] = useState<'production' | 'sales' | 'finance'>('production');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [flocks, setFlocks] = useState<any[]>([]);
  const [selectedFlockId, setSelectedFlockId] = useState('');

  // Data
  const [dailyEntries, setDailyEntries] = useState<any[]>([]);
  const [salesEntries, setSalesEntries] = useState<any[]>([]);
  const [financeSummary, setFinanceSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch of user and flocks
    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/flocks').then((r) => (r.ok ? r.json() : [])),
    ]).then(([uRes, fRes]) => {
      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(fRes)) setFlocks(fRes);
    });
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'production') {
        const url = selectedFlockId
          ? `/api/daily-entry?flockId=${selectedFlockId}&limit=100`
          : `/api/daily-entry?limit=100`;
        const res = await fetch(url);
        const data = await res.json();
        setDailyEntries(Array.isArray(data) ? data : []);
      } else if (reportType === 'sales') {
        const res = await fetch('/api/sales?limit=100');
        const data = await res.json();
        setSalesEntries(Array.isArray(data) ? data : []);
      } else if (reportType === 'finance') {
        const res = await fetch(`/api/finance/summary?month=${month}`);
        const data = await res.json();
        setFinanceSummary(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedFlockId, month]);

  const exportToExcel = () => {
    let rows: any[] = [];
    let filename = 'poultry_report.xlsx';

    if (reportType === 'production') {
      filename = `egg_production_report_${month}.xlsx`;
      rows = dailyEntries.map((e) => ({
        তারিখ: e.date,
        ফ্লক: e.flockId?.name || '',
        'মোট সংগৃহীত ডিম': e.totalEggs,
        'ভালো ডিম': e.goodEggs,
        'ভাঙা ডিম': e.brokenEggs,
        'উৎপাদন হার (%)': `${e.eggProductionPercentage}%`,
        'খাদ্য ব্যবহার (কেজি)': e.feedConsumedKg,
        মৃত্যু: e.mortalityCount,
        'সমাপনী মুরগি': e.closingBirdCount,
      }));
    } else if (reportType === 'sales') {
      filename = `egg_sales_report_${month}.xlsx`;
      rows = salesEntries.map((s) => ({
        'চালান নং': s.invoiceNo,
        তারিখ: s.date,
        'ক্রেতার নাম': s.customerName,
        পরিমাণ: `${s.quantityInUnit} ${s.unitType}`,
        'মোট ডিম (পিস)': s.totalPieces,
        দর: s.unitPrice,
        'মোট বিল (৳)': s.grandTotal,
        'পরিশোধ (৳)': s.paidAmount,
        'বকেয়া (৳)': s.dueAmount,
      }));
    }

    if (rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, filename);
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                রিপোর্ট ও বিশ্লেষণ কেন্দ্র
              </h2>
              <Badge variant="emerald">এক্সপোর্ট ও প্রিন্ট</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ডিম উৎপাদন, বিক্রয় ও আর্থিক লাভ-ক্ষতির সম্পূর্ণ প্রিন্টযোগ্য বিবরণী
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={exportToExcel}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            >
              Excel এ ডাউনলোড
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => window.print()}
              icon={<Printer className="w-4 h-4" />}
            >
              প্রিন্ট করুন
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="p-4 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                রিপোর্টের বিষয় নির্বাচন
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="production">ডিম উৎপাদন ও সংগ্রহ রিপোর্ট</option>
                <option value="sales">ডিম বিক্রয় ও আদায় রিপোর্ট</option>
                <option value="finance">মাসিক আয় ও ব্যয় সারসংক্ষেপ</option>
              </select>
            </div>

            {reportType === 'production' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  ফ্লক অনুযায়ী ফিল্টার
                </label>
                <select
                  value={selectedFlockId}
                  onChange={(e) => setSelectedFlockId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- সকল ফ্লক / ব্যাচ --</option>
                  {flocks.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.batchId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">মাস</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </Card>

        {/* Printable Document Container */}
        <Card className="print:border-none print:shadow-none">
          {/* Print Header */}
          <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-4">
            <h1 className="text-xl font-bold text-slate-900">আওলাদ এগ্রো অ্যান্ড পোল্ট্রি ফার্ম</h1>
            <p className="text-xs text-slate-500">গাজীপুর, ঢাকা • ফোন: +৮৮০ ১৭০০-০০০০০০</p>
            <h2 className="text-sm font-bold text-emerald-800 mt-2 uppercase tracking-wider">
              {reportType === 'production'
                ? 'ডিম উৎপাদন ও সংগ্রহ বিবরণী'
                : reportType === 'sales'
                ? 'ডিম বিক্রয় ও চালান বিবরণী'
                : 'মাসিক আর্থিক লাভ-ক্ষতি প্রতিবেদন'}
            </h2>
            <p className="text-xs text-slate-400">প্রতিবেদন তৈরির সময়: {formatBengaliDate(new Date())}</p>
          </div>

          {/* REPORT TYPE 1: PRODUCTION */}
          {reportType === 'production' && (
            <div>
              <CardHeader className="print:hidden">
                <CardTitle>ডিম উৎপাদন ও সংগ্রহ বিস্তারিত তালিকা</CardTitle>
                <Badge variant="emerald">মোট রেকর্ড: {toBengaliNumber(dailyEntries.length)} দিন</Badge>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">ফ্লক</th>
                      <th className="py-2.5 px-3 text-right">মোট ডিম</th>
                      <th className="py-2.5 px-3 text-right">ভালো ডিম</th>
                      <th className="py-2.5 px-3 text-right">ভাঙা ডিম</th>
                      <th className="py-2.5 px-3 text-right">উৎপাদন %</th>
                      <th className="py-2.5 px-3 text-right">খাদ্য (কেজি)</th>
                      <th className="py-2.5 px-3 text-right">মৃত্যু</th>
                      <th className="py-2.5 px-3 text-right">সমাপনী মুরগি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailyEntries.map((e) => (
                      <tr key={e._id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 text-xs font-semibold text-slate-800">
                          {formatBengaliDate(e.date)}
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-700">
                          {e.flockId?.name || 'ফ্লক'}
                        </td>
                        <td className="py-2 px-3 text-xs font-bold text-emerald-800 text-right">
                          {toBengaliNumber(e.totalEggs)}
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-600 text-right">
                          {toBengaliNumber(e.goodEggs)}
                        </td>
                        <td className="py-2 px-3 text-xs text-rose-600 text-right">
                          {toBengaliNumber(e.brokenEggs)}
                        </td>
                        <td className="py-2 px-3 text-xs font-semibold text-emerald-700 text-right">
                          {toBengaliNumber(e.eggProductionPercentage)}%
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-700 text-right">
                          {toBengaliNumber(e.feedConsumedKg)}
                        </td>
                        <td className="py-2 px-3 text-xs text-rose-600 text-right">
                          {toBengaliNumber(e.mortalityCount)}
                        </td>
                        <td className="py-2 px-3 text-xs font-bold text-slate-900 text-right">
                          {toBengaliNumber(e.closingBirdCount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT TYPE 2: SALES */}
          {reportType === 'sales' && (
            <div>
              <CardHeader className="print:hidden">
                <CardTitle>ডিম বিক্রয় ও আদায় চালান তালিকা</CardTitle>
                <Badge variant="emerald">মোট চালান: {toBengaliNumber(salesEntries.length)}টি</Badge>
              </CardHeader>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                      <th className="py-2.5 px-3">চালান নং</th>
                      <th className="py-2.5 px-3">তারিখ</th>
                      <th className="py-2.5 px-3">ক্রেতার নাম</th>
                      <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                      <th className="py-2.5 px-3 text-right">মোট ডিম (পিস)</th>
                      <th className="py-2.5 px-3 text-right">দর (৳)</th>
                      <th className="py-2.5 px-3 text-right">মোট বিল (৳)</th>
                      <th className="py-2.5 px-3 text-right">পরিশোধ</th>
                      <th className="py-2.5 px-3 text-right">বকেয়া</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {salesEntries.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-mono font-bold text-xs text-slate-900">
                          {s.invoiceNo}
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-600">
                          {formatBengaliDate(s.date)}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-800 text-xs">
                          {s.customerName}
                        </td>
                        <td className="py-2 px-3 text-xs font-semibold text-slate-800 text-right">
                          {toBengaliNumber(s.quantityInUnit)} {s.unitType === 'TRAY' ? 'ট্রে' : ''}
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-600 text-right">
                          {toBengaliNumber(s.totalPieces)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right">{formatTaka(s.unitPrice)}</td>
                        <td className="py-2 px-3 text-xs font-bold text-slate-900 text-right">
                          {formatTaka(s.grandTotal)}
                        </td>
                        <td className="py-2 px-3 text-xs font-semibold text-emerald-700 text-right">
                          {formatTaka(s.paidAmount)}
                        </td>
                        <td className="py-2 px-3 text-xs font-bold text-rose-600 text-right">
                          {s.dueAmount > 0 ? formatTaka(s.dueAmount) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORT TYPE 3: FINANCE SUMMARY */}
          {reportType === 'finance' && financeSummary && (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-800 mb-2">আয় বিবরণী</h3>
                  <div className="flex justify-between text-xs">
                    <span>ডিম বিক্রয় বাবদ আয়:</span>
                    <span className="font-semibold text-emerald-700">
                      {formatTaka(financeSummary.income?.eggSales || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>অন্যান্য উৎস থেকে আয়:</span>
                    <span className="font-semibold text-emerald-700">
                      {formatTaka(financeSummary.income?.otherIncome || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                    <span>সর্বমোট আয়:</span>
                    <span>{formatTaka(financeSummary.income?.totalIncome || 0)}</span>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-sm text-slate-800 mb-2">ব্যয় বিবরণী</h3>
                  <div className="flex justify-between text-xs">
                    <span>মোট পরিচালন ব্যয় (অপারেটিং):</span>
                    <span className="font-semibold text-rose-600">
                      {formatTaka(financeSummary.expense?.totalExpense || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200">
                    <span>সর্বমোট ব্যয়:</span>
                    <span>{formatTaka(financeSummary.expense?.totalExpense || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800">
                  চলতি মাসের আনুমানিক লাভ / (ক্ষতি):
                </span>
                <span
                  className={`text-xl font-black ${
                    financeSummary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {formatTaka(financeSummary.netProfit)}
                </span>
              </div>
            </div>
          )}

          {/* Printable Signature Footers */}
          <div className="hidden print:flex justify-between items-end pt-16 px-4 text-xs text-slate-600">
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1" />
              <span>ফার্ম ম্যানেজার</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1" />
              <span>হিসাবরক্ষক</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-t border-slate-400 mb-1" />
              <span>খামার মালিক / কর্তৃপক্ষ</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
