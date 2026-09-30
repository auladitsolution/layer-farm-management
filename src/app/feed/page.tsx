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
  Wheat,
  Plus,
  Truck,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Package,
  Layers,
  CreditCard,
  Building2,
} from 'lucide-react';
import { IUser } from '@/types';

export default function FeedPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'purchases' | 'suppliers'>('inventory');
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isFeedItemModalOpen, setIsFeedItemModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSupplierPayModalOpen, setIsSupplierPayModalOpen] = useState(false);
  const [selectedSupplierForPay, setSelectedSupplierForPay] = useState<any>(null);

  // Forms
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    feedItemId: '',
    date: new Date().toISOString().split('T')[0],
    bagCount: '',
    pricePerKg: '',
    transportCost: '0',
    discount: '0',
    paidAmount: '0',
    paymentMethod: 'CASH',
    notes: '',
  });

  const [feedItemForm, setFeedItemForm] = useState({
    name: '',
    type: 'LAYER_1',
    brand: '',
    unit: 'কেজি',
    bagWeightKg: '50',
    lowStockThresholdKg: '200',
    notes: '',
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    address: '',
    category: 'FEED',
    openingBalance: '0',
    notes: '',
  });

  const [supplierPayForm, setSupplierPayForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionRef: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, fRes, pRes, sRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/feed').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/feed/purchases').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/suppliers').then((r) => (r.ok ? r.json() : [])),
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(fRes)) setFeedItems(fRes);
      if (Array.isArray(pRes)) setPurchases(pRes);
      if (Array.isArray(sRes)) setSuppliers(sRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Purchase live calculations
  const bags = Number(purchaseForm.bagCount) || 0;
  const priceKg = Number(purchaseForm.pricePerKg) || 0;
  const transport = Number(purchaseForm.transportCost) || 0;
  const disc = Number(purchaseForm.discount) || 0;
  const paid = Number(purchaseForm.paidAmount) || 0;

  const targetFeed = feedItems.find((f) => f._id === purchaseForm.feedItemId);
  const bagWeight = targetFeed?.bagWeightKg || 50;
  const totalKg = bags * bagWeight;
  const subTotal = Math.round(totalKg * priceKg * 100) / 100;
  const totalCost = Math.max(0, Math.round((subTotal + transport - disc) * 100) / 100);
  const dueAmount = Math.max(0, Math.round((totalCost - paid) * 100) / 100);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/feed/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ক্রয় চালান তৈরি ব্যর্থ হয়েছে');

      setFeedback({ type: 'success', message: 'খাদ্য ক্রয়ের চালান সফলভাবে সংরক্ষণ ও স্টক বৃদ্ধি করা হয়েছে!' });
      setIsPurchaseModalOpen(false);
      setPurchaseForm({
        supplierId: '',
        feedItemId: '',
        date: new Date().toISOString().split('T')[0],
        bagCount: '',
        pricePerKg: '',
        transportCost: '0',
        discount: '0',
        paidAmount: '0',
        paymentMethod: 'CASH',
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

  const handleCreateFeedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedItemForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'খাদ্য যোগ করতে সমস্যা হয়েছে');

      setFeedback({ type: 'success', message: 'নতুন খাদ্য আইটেম সফলভাবে যুক্ত হয়েছে!' });
      setIsFeedItemModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'সরবরাহকারী সংরক্ষণ ব্যর্থ');

      setFeedback({ type: 'success', message: 'নতুন সরবরাহকারী সফলভাবে যুক্ত হয়েছে!' });
      setIsSupplierModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierForPay) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/suppliers/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplierForPay._id,
          amount: supplierPayForm.amount,
          paymentMethod: supplierPayForm.paymentMethod,
          transactionRef: supplierPayForm.transactionRef,
          notes: supplierPayForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'দেনা পরিশোধ ব্যর্থ');

      setFeedback({
        type: 'success',
        message: `${selectedSupplierForPay.name} কে ৳${supplierPayForm.amount} সফলভাবে পরিশোধ করা হয়েছে!`,
      });
      setIsSupplierPayModalOpen(false);
      fetchData();
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
                খাদ্য ও সরবরাহকারী ব্যবস্থাপনা
              </h2>
              <Badge variant="emerald">ফিড ইনভেন্টরি</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              খাদ্যের বর্তমান স্টক, ক্রয় চালান, ফিড সরবরাহকারী ও দেনা-পাওনার হিসাব
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsFeedItemModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              খাদ্য আইটেম যোগ
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsPurchaseModalOpen(true)}
              icon={<Truck className="w-4 h-4" />}
            >
              নতুন খাদ্য ক্রয় চালান
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            বর্তমান খাদ্য স্টক ({toBengaliNumber(feedItems.length)})
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'purchases'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            খাদ্য ক্রয়ের চালান ({toBengaliNumber(purchases.length)})
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            সরবরাহকারী ও দেনা ({toBengaliNumber(suppliers.length)})
          </button>
        </div>

        {/* TAB 1: Stock Inventory Cards */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedItems.map((feed) => {
                const isLowStock = feed.currentStockKg <= feed.lowStockThresholdKg;

                return (
                  <Card key={feed._id} className="relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{feed.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">ব্র্যান্ড: {feed.brand}</p>
                      </div>
                      <Badge variant={isLowStock ? 'rose' : 'emerald'}>
                        {isLowStock ? 'স্টক কম!' : 'পর্যাপ্ত'}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">বর্তমান মজুদ:</span>
                        <span className="text-2xl font-black text-slate-900">
                          {toBengaliNumber(feed.currentStockKg)}{' '}
                          <span className="text-xs font-normal text-slate-500">কেজি</span>
                        </span>
                      </div>

                      <div className="flex justify-between text-xs text-slate-600">
                        <span>বস্তা সংখ্যা ({feed.bagWeightKg} কেজি/বস্তা):</span>
                        <strong className="text-slate-800">
                          {toBengaliNumber(Math.floor(feed.currentStockKg / (feed.bagWeightKg || 50)))}{' '}
                          বস্তা
                        </strong>
                      </div>

                      <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <span>সতর্কসীমা: {toBengaliNumber(feed.lowStockThresholdKg)} কেজি</span>
                        <span>গড় ক্রয়মূল্য: {formatTaka(feed.averagePurchasePricePerKg)}/কেজি</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Purchase Invoices Table */}
        {activeTab === 'purchases' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>খাদ্য ক্রয়ের চালানসমূহ</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">ক্রয়কৃত খাদ্য, পরিবহন খরচ ও দেনার বিবরণ</p>
              </div>
            </CardHeader>

            {loading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : purchases.length === 0 ? (
              <EmptyState
                title="কোনো খাদ্য ক্রয়ের রেকর্ড নেই"
                description="নতুন খাদ্য ক্রয় চালান এন্ট্রি করতে উপরের বোতামটি ব্যবহার করুন।"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                      <th className="py-3 px-4">চালান নং</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">সরবরাহকারী</th>
                      <th className="py-3 px-4">খাদ্যের নাম</th>
                      <th className="py-3 px-4">বস্তা (কেজি)</th>
                      <th className="py-3 px-4">দর/কেজি (৳)</th>
                      <th className="py-3 px-4">মোট বিল (৳)</th>
                      <th className="py-3 px-4">পরিশোধ</th>
                      <th className="py-3 px-4">দেনা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {purchases.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                          {p.invoiceNo}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {formatBengaliDate(p.date)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{p.supplierName}</td>
                        <td className="py-3 px-4 text-xs text-slate-700">{p.feedName}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                          {toBengaliNumber(p.bagCount)} বস্তা ({toBengaliNumber(p.totalKg)} কেজি)
                        </td>
                        <td className="py-3 px-4 text-xs">{formatTaka(p.pricePerKg)}</td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-900">
                          {formatTaka(p.totalCost)}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                          {formatTaka(p.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-rose-600">
                          {p.dueAmount > 0 ? formatTaka(p.dueAmount) : 'পরিশোধিত'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: Suppliers */}
        {activeTab === 'suppliers' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>সরবরাহকারী তালিকা ও দেনার খতিয়ান</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">ফিড, বাচ্চা ও মেডিসিন সরবরাহকারী প্রতিষ্ঠানসমূহ</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSupplierModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                নতুন সরবরাহকারী যোগ
              </Button>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">প্রতিষ্ঠান ও নাম</th>
                    <th className="py-3 px-4">ক্যাটাগরি</th>
                    <th className="py-3 px-4">ফোন ও ঠিকানা</th>
                    <th className="py-3 px-4">মোট ক্রয়</th>
                    <th className="py-3 px-4">মোট পরিশোধ</th>
                    <th className="py-3 px-4">বর্তমান দেনা</th>
                    <th className="py-3 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {suppliers.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        {s.companyName && (
                          <div className="text-xs text-slate-500 font-medium">{s.companyName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="slate">
                          {s.category === 'FEED'
                            ? 'খাদ্য'
                            : s.category === 'MEDICINE'
                            ? 'ওষুধ'
                            : 'অন্যান্য'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        <div>{s.phone}</div>
                        {s.address && <div className="text-[11px] text-slate-400">{s.address}</div>}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {formatTaka(s.totalPurchases || 0)}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                        {formatTaka(s.totalPaid || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-rose-600">
                        {s.currentPayable > 0 ? (
                          <span className="bg-rose-50 px-2 py-0.5 rounded">
                            {formatTaka(s.currentPayable)} (দেনা)
                          </span>
                        ) : (
                          <Badge variant="emerald">পরিশোধিত</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {s.currentPayable > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSupplierForPay(s);
                              setSupplierPayForm({
                                amount: String(s.currentPayable),
                                paymentMethod: 'CASH',
                                transactionRef: '',
                                notes: '',
                              });
                              setIsSupplierPayModalOpen(true);
                            }}
                            icon={<CreditCard className="w-3.5 h-3.5" />}
                          >
                            দেনা পরিশোধ
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal 1: New Feed Purchase */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="নতুন খাদ্য ক্রয়ের চালান সংরক্ষণ"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="সরবরাহকারী নির্বাচন করুন"
              value={purchaseForm.supplierId}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
              required
            >
              <option value="">-- সরবরাহকারী বাছাই করুন --</option>
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.companyName || s.category})
                </option>
              ))}
            </Select>

            <Input
              label="চালান তারিখ"
              type="date"
              value={purchaseForm.date}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="খাদ্যের ধরন"
              value={purchaseForm.feedItemId}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, feedItemId: e.target.value })}
              required
            >
              <option value="">-- খাদ্য নির্বাচন করুন --</option>
              {feedItems.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} ({f.brand})
                </option>
              ))}
            </Select>

            <Input
              label="বস্তার সংখ্যা"
              type="number"
              min="1"
              placeholder="যেমন: ২০"
              value={purchaseForm.bagCount}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, bagCount: e.target.value })}
              required
            />

            <Input
              label="প্রতি কেজির দর (৳)"
              type="number"
              step="0.01"
              min="1"
              placeholder="যেমন: ৬২"
              value={purchaseForm.pricePerKg}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, pricePerKg: e.target.value })}
              required
            />
          </div>

          {/* Live Calculation */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span>মোট খাদ্য ওজন:</span>
              <strong className="text-amber-950">
                {toBengaliNumber(totalKg)} কেজি ({toBengaliNumber(bags)} বস্তা)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>খাদ্যের মূল দাম (সাবটোটাল):</span>
              <span className="font-semibold">{formatTaka(subTotal)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-amber-200 pt-1">
              <span>সর্বমোট খরচ (বিল):</span>
              <span className="text-amber-950">{formatTaka(totalCost)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="পরিবহন খরচ (৳)"
              type="number"
              min="0"
              value={purchaseForm.transportCost}
              onChange={(e) =>
                setPurchaseForm({ ...purchaseForm, transportCost: e.target.value })
              }
            />

            <Input
              label="নগদ পরিশোধ (৳)"
              type="number"
              min="0"
              value={purchaseForm.paidAmount}
              onChange={(e) => setPurchaseForm({ ...purchaseForm, paidAmount: e.target.value })}
            />

            <Select
              label="পরিশোধের মাধ্যম"
              value={purchaseForm.paymentMethod}
              onChange={(e) =>
                setPurchaseForm({ ...purchaseForm, paymentMethod: e.target.value })
              }
            >
              <option value="CASH">ক্যাশ / নগদ</option>
              <option value="BANK">ব্যাংক ট্রান্সফার</option>
              <option value="BKASH">বিকাশ (bKash)</option>
              <option value="NAGAD">নগদ (Nagad)</option>
            </Select>
          </div>

          {dueAmount > 0 && (
            <div className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex justify-between">
              <span>সরবরাহকারীকে দেনা যোগ হবে:</span>
              <span>{formatTaka(dueAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPurchaseModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              চালান সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Feed Item */}
      <Modal
        isOpen={isFeedItemModalOpen}
        onClose={() => setIsFeedItemModalOpen(false)}
        title="নতুন খাদ্য আইটেম যুক্ত করুন"
      >
        <form onSubmit={handleCreateFeedItem} className="space-y-4">
          <Input
            label="খাদ্যের নাম"
            placeholder="যেমন: লেয়ার প্রি-লে ফিড"
            value={feedItemForm.name}
            onChange={(e) => setFeedItemForm({ ...feedItemForm, name: e.target.value })}
            required
          />
          <Input
            label="ব্র্যান্ড বা প্রস্তুতকারক"
            placeholder="যেমন: নারিশ / সিপি / আফতাব"
            value={feedItemForm.brand}
            onChange={(e) => setFeedItemForm({ ...feedItemForm, brand: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="প্রতি বস্তার ওজন (কেজি)"
              type="number"
              min="1"
              value={feedItemForm.bagWeightKg}
              onChange={(e) =>
                setFeedItemForm({ ...feedItemForm, bagWeightKg: e.target.value })
              }
              required
            />
            <Input
              label="সতর্কসীমা থ্রেশহোল্ড (কেজি)"
              type="number"
              min="0"
              value={feedItemForm.lowStockThresholdKg}
              onChange={(e) =>
                setFeedItemForm({ ...feedItemForm, lowStockThresholdKg: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFeedItemModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              আইটেম সংরক্ষণ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Add Supplier */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title="নতুন সরবরাহকারী নিবন্ধন করুন"
      >
        <form onSubmit={handleCreateSupplier} className="space-y-4">
          <Input
            label="সরবরাহকারী বা ডিলারের নাম"
            placeholder="যেমন: মেসার্স রহিম পোল্ট্রি ফিড"
            value={supplierForm.name}
            onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
            required
          />
          <Input
            label="মোবাইল নম্বর"
            placeholder="যেমন: 01712-XXXXXX"
            value={supplierForm.phone}
            onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
            required
          />
          <Input
            label="ঠিকানা"
            placeholder="যেমন: শ্রীপুর, গাজীপুর"
            value={supplierForm.address}
            onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
          />
          <Select
            label="ক্যাটাগরি"
            value={supplierForm.category}
            onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
          >
            <option value="FEED">পোল্ট্রি খাদ্য (Feed)</option>
            <option value="CHICKS">বাচ্চা / মুরগি (Chicks)</option>
            <option value="MEDICINE">ওষুধ ও ভ্যাকসিন (Medicine)</option>
            <option value="EQUIPMENT">ফার্ম সরঞ্জাম (Equipment)</option>
            <option value="OTHER">অন্যান্য</option>
          </Select>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSupplierModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              সরবরাহকারী সংরক্ষণ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Supplier Payment Settlement */}
      <Modal
        isOpen={isSupplierPayModalOpen}
        onClose={() => setIsSupplierPayModalOpen(false)}
        title="সরবরাহকারীকে দেনা পরিশোধ"
      >
        <form onSubmit={handlePaySupplier} className="space-y-4">
          {selectedSupplierForPay && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-bold text-slate-800 text-sm">
                {selectedSupplierForPay.name}
              </div>
              <div className="text-slate-600">
                বর্তমান মোট দেনা:{' '}
                <strong className="text-rose-600">
                  {formatTaka(selectedSupplierForPay.currentPayable)}
                </strong>
              </div>
            </div>
          )}

          <Input
            label="পরিশোধের টাকার পরিমাণ (৳)"
            type="number"
            min="1"
            max={selectedSupplierForPay?.currentPayable}
            value={supplierPayForm.amount}
            onChange={(e) =>
              setSupplierPayForm({ ...supplierPayForm, amount: e.target.value })
            }
            required
          />

          <Select
            label="পেমেন্টের মাধ্যম"
            value={supplierPayForm.paymentMethod}
            onChange={(e) =>
              setSupplierPayForm({ ...supplierPayForm, paymentMethod: e.target.value })
            }
          >
            <option value="CASH">ক্যাশ / নগদ</option>
            <option value="BANK">ব্যাংক ট্রান্সফার</option>
            <option value="BKASH">বিকাশ (bKash)</option>
            <option value="NAGAD">নগদ (Nagad)</option>
          </Select>

          <Input
            label="চেক নং / ট্রানজেকশন রেফারেন্স (ঐচ্ছিক)"
            placeholder="যেমন: ব্যাংক চেক নং বা ভাউচার"
            value={supplierPayForm.transactionRef}
            onChange={(e) =>
              setSupplierPayForm({ ...supplierPayForm, transactionRef: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSupplierPayModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              পরিশোধ নিশ্চিত করুন
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
