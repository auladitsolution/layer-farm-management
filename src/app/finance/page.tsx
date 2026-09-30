'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatTaka, formatBengaliDate } from '@/lib/utils';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { IUser } from '@/types';

export default function FinancePage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'income' | 'summary'>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);

  // Forms
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'ELECTRICITY',
    description: '',
    amount: '',
    paymentMethod: 'CASH',
    supplierOrPayee: '',
    notes: '',
  });

  const [incomeForm, setIncomeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'SPENT_HEN',
    description: '',
    amount: '',
    paymentMethod: 'CASH',
    customerOrPayer: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, expRes, incRes, sumRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/finance/expenses').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/finance/income').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/finance/summary').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(expRes)) setExpenses(expRes);
      if (Array.isArray(incRes)) setIncomes(incRes);
      if (sumRes) setSummary(sumRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'খরচ এন্ট্রি ব্যর্থ হয়েছে');

      setFeedback({ type: 'success', message: 'নতুন খরচ সফলভাবে সংরক্ষণ করা হয়েছে!' });
      setIsExpenseModalOpen(false);
      setExpenseForm({
        date: new Date().toISOString().split('T')[0],
        category: 'ELECTRICITY',
        description: '',
        amount: '',
        paymentMethod: 'CASH',
        supplierOrPayee: '',
        notes: '',
      });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/finance/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'আয় এন্ট্রি ব্যর্থ হয়েছে');

      setFeedback({ type: 'success', message: 'অন্যান্য আয় সফলভাবে রেকর্ড করা হয়েছে!' });
      setIsIncomeModalOpen(false);
      setIncomeForm({
        date: new Date().toISOString().split('T')[0],
        source: 'SPENT_HEN',
        description: '',
        amount: '',
        paymentMethod: 'CASH',
        customerOrPayer: '',
        notes: '',
      });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const todayCash = summary?.todayCash || {};

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                আয় ও ব্যয় ব্যবস্থাপনা
              </h2>
              <Badge variant="emerald">অ্যাকাউন্টিং</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              খামারের দৈনন্দিন খরচ, অন্যান্য আয় এবং চলতি মাসের লাভ-ক্ষতির পূর্ণ বিবরণ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsIncomeModalOpen(true)}
              icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
            >
              অন্যান্য আয় যোগ
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsExpenseModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              নতুন খরচ এন্ট্রি
            </Button>
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

        {/* Quick Cash Flow Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-emerald-50/50 border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                আজকের নগদ জমা (Cash In)
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-emerald-950">
              {formatTaka(todayCash.cashIn || 0)}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">নগদ বিক্রয় ও বকেয়া আদায়</p>
          </Card>

          <Card className="bg-rose-50/50 border-rose-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
                আজকের নগদ খরচ (Cash Out)
              </span>
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-rose-950">
              {formatTaka(todayCash.cashOut || 0)}
            </div>
            <p className="text-[11px] text-rose-700 mt-1">আজকের পরিশোধিত খরচ</p>
          </Card>

          <Card className="bg-sky-50/50 border-sky-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                আজকের নেট ক্যাশ স্থিতি
              </span>
              <DollarSign className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-2 text-2xl font-bold text-sky-950">
              {formatTaka(todayCash.netCash || 0)}
            </div>
            <p className="text-[11px] text-sky-700 mt-1">দিনের উদ্বৃত্ত নগদ টাকা</p>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'expenses'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            খরচের হিসাব ({toBengaliNumber(expenses.length)})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'income'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            অন্যান্য আয় ({toBengaliNumber(incomes.length)})
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'summary'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            মাসিক লাভ-ক্ষতি সারসংক্ষেপ
          </button>
        </div>

        {/* TAB 1: Expenses */}
        {activeTab === 'expenses' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>খামারের নিয়মিত খরচের তালিকা</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  বিদ্যুৎ, বেতন, ওষুধ, খাদ্য ও ফার্ম রক্ষণাবেক্ষণ খরচ
                </p>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">খরচের বিবরণ</th>
                    <th className="py-3 px-4">প্রাপক / ব্যক্তি</th>
                    <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                    <th className="py-3 px-4 text-right">টাকার পরিমাণ (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {formatBengaliDate(e.date)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="slate">{e.category}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800">
                        {e.description}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {e.supplierOrPayee || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{e.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm font-bold text-rose-600 text-right">
                        {formatTaka(e.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 2: Income */}
        {activeTab === 'income' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>অন্যান্য আয় (Non-Egg Sales)</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  পুরাতন মুরগি বিক্রয়, লিটার/বিষ্ঠা বিক্রয় ও বস্তা বিক্রয়ের হিসাব
                </p>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">উৎস</th>
                    <th className="py-3 px-4">বিবরণ</th>
                    <th className="py-3 px-4">ক্রেতা</th>
                    <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                    <th className="py-3 px-4 text-right">আয়ের পরিমাণ (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incomes.map((i) => (
                    <tr key={i._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {formatBengaliDate(i.date)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="emerald">
                          {i.source === 'SPENT_HEN'
                            ? 'পুরাতন মুরগি'
                            : i.source === 'MANURE_LITTER'
                            ? 'লিটার/বিষ্ঠা'
                            : i.source === 'FEED_BAGS'
                            ? 'খালি বস্তা'
                            : 'অন্যান্য'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800">
                        {i.description}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {i.customerOrPayer || '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{i.paymentMethod}</td>
                      <td className="py-3 px-4 text-sm font-bold text-emerald-700 text-right">
                        {formatTaka(i.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* TAB 3: Summary Profit & Loss */}
        {activeTab === 'summary' && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>চলতি মাসের আয় খাত</CardTitle>
              </CardHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">ডিম বিক্রয় বাবদ আয়:</span>
                  <span className="font-bold text-emerald-700">
                    {formatTaka(summary.income?.eggSales || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">অন্যান্য আয় (লিটার, মুরগি):</span>
                  <span className="font-bold text-emerald-700">
                    {formatTaka(summary.income?.otherIncome || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 font-black text-base bg-emerald-50 px-3 rounded-lg text-emerald-950">
                  <span>সর্বমোট আয়:</span>
                  <span>{formatTaka(summary.income?.totalIncome || 0)}</span>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>চলতি মাসের লাভ-ক্ষতির ফলাফল</CardTitle>
              </CardHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">সর্বমোট আয়:</span>
                  <span className="font-bold text-slate-800">
                    {formatTaka(summary.income?.totalIncome || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">সর্বমোট ব্যয় (অপারেটিং খরচ):</span>
                  <span className="font-bold text-rose-600">
                    {formatTaka(summary.expense?.totalExpense || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-3 font-black text-base bg-slate-100 px-3 rounded-lg text-slate-900">
                  <span>আনুমানিক নেট লাভ / (ক্ষতি):</span>
                  <span
                    className={summary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}
                  >
                    {formatTaka(summary.netProfit)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal 1: Add Expense */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="নতুন খরচ রেকর্ড করুন"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="তারিখ"
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
              required
            />
            <Select
              label="খরচের ক্যাটাগরি"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              required
            >
              <option value="ELECTRICITY">বিদ্যুৎ বিল</option>
              <option value="SALARY">কর্মীদের বেতন</option>
              <option value="LABOUR">দৈনিক মজুরি</option>
              <option value="FEED">খাদ্য সংক্রান্ত খরচ</option>
              <option value="MEDICINE">ওষুধ ও ভ্যাকসিন</option>
              <option value="TRANSPORT">পরিবহন ও যাতায়াত</option>
              <option value="REPAIRS">মেরামত ও রক্ষণাবেক্ষণ</option>
              <option value="EQUIPMENT">ফার্ম সরঞ্জাম</option>
              <option value="LITTER">তুষ / লিটার সামগ্রী</option>
              <option value="BIOSECURITY">জীবাণুনাশক / বায়োসিকিউরিটি</option>
              <option value="MISCELLANEOUS">অন্যান্য খরচ</option>
            </Select>
          </div>

          <Input
            label="খরচের বিবরণ"
            placeholder="যেমন: মার্চ মাসের খামারের বিদ্যুৎ বিল পরিশোধ"
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="টাকার পরিমাণ (৳)"
              type="number"
              min="1"
              placeholder="যেমন: ৩৫০০"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              required
            />

            <Select
              label="পেমেন্টের মাধ্যম"
              value={expenseForm.paymentMethod}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })
              }
            >
              <option value="CASH">ক্যাশ / নগদ</option>
              <option value="BKASH">বিকাশ (bKash)</option>
              <option value="NAGAD">নগদ (Nagad)</option>
              <option value="BANK">ব্যাংক ট্রান্সফার</option>
            </Select>
          </div>

          <Input
            label="প্রাপক ব্যক্তি বা প্রতিষ্ঠান (ঐচ্ছিক)"
            placeholder="যেমন: পল্লী বিদ্যুৎ সমিতি"
            value={expenseForm.supplierOrPayee}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, supplierOrPayee: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              খরচ সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Income */}
      <Modal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        title="অন্যান্য আয় রেকর্ড করুন"
      >
        <form onSubmit={handleCreateIncome} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="তারিখ"
              type="date"
              value={incomeForm.date}
              onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
              required
            />
            <Select
              label="আয়ের উৎস"
              value={incomeForm.source}
              onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })}
              required
            >
              <option value="SPENT_HEN">পুরাতন বাতিল মুরগি বিক্রয়</option>
              <option value="MANURE_LITTER">মুরগির বিষ্ঠা / জৈব সার বিক্রয়</option>
              <option value="FEED_BAGS">খালি ফিডের বস্তা বিক্রয়</option>
              <option value="OTHER">অন্যান্য আয়</option>
            </Select>
          </div>

          <Input
            label="আয়ের বিবরণ"
            placeholder="যেমন: ৫০টি পুরাতন মুরগি বিক্রয়"
            value={incomeForm.description}
            onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="টাকার পরিমাণ (৳)"
              type="number"
              min="1"
              placeholder="যেমন: ১২৫০০"
              value={incomeForm.amount}
              onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
              required
            />
            <Select
              label="পেমেন্টের মাধ্যম"
              value={incomeForm.paymentMethod}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, paymentMethod: e.target.value })
              }
            >
              <option value="CASH">ক্যাশ / নগদ</option>
              <option value="BKASH">বিকাশ (bKash)</option>
              <option value="NAGAD">নগদ (Nagad)</option>
              <option value="BANK">ব্যাংক ট্রান্সফার</option>
            </Select>
          </div>

          <Input
            label="ক্রেতার নাম (ঐচ্ছিক)"
            placeholder="যেমন: পাইকার মোঃ সেলিম"
            value={incomeForm.customerOrPayer}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, customerOrPayer: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsIncomeModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              আয় সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
