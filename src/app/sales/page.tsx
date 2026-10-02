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
  ShoppingCart,
  Plus,
  Users,
  Printer,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Phone,
  MapPin,
} from 'lucide-react';
import { IUser } from '@/types';

export default function SalesPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [activeTab, setActiveTab] = useState<'sales' | 'customers'>('sales');
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [eggInventory, setEggInventory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomerForPayment, setSelectedCustomerForPayment] = useState<any>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<any>(null);

  // Forms
  const [saleForm, setSaleForm] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    unitType: 'TRAY',
    quantityInUnit: '',
    unitPrice: '',
    discount: '0',
    paidAmount: '0',
    paymentMethod: 'CASH',
    notes: '',
  });

  const [customerForm, setCustomerForm] = useState({
    name: '',
    businessName: '',
    phone: '',
    address: '',
    openingBalance: '0',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'CASH',
    transactionRef: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, sRes, cRes, invRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sales').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/customers').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/eggs/inventory').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(sRes)) setSales(sRes);
      if (Array.isArray(cRes)) setCustomers(cRes);
      if (invRes) setEggInventory(invRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Live calculations for sale form
  const qty = Number(saleForm.quantityInUnit) || 0;
  const price = Number(saleForm.unitPrice) || 0;
  const disc = Number(saleForm.discount) || 0;
  const paid = Number(saleForm.paidAmount) || 0;
  const traySize = eggInventory?.traySize || 30;

  const convRate = saleForm.unitType === 'TRAY' ? traySize : saleForm.unitType === 'DOZEN' ? 12 : 1;
  const totalPieces = Math.round(qty * convRate);
  const subTotal = Math.round(qty * price * 100) / 100;
  const grandTotal = Math.max(0, Math.round((subTotal - disc) * 100) / 100);
  const dueAmount = Math.max(0, Math.round((grandTotal - paid) * 100) / 100);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'চালান তৈরি করতে সমস্যা হয়েছে');

      setFeedback({ type: 'success', message: 'ডিম বিক্রয় চালান সফলভাবে তৈরি হয়েছে!' });
      setIsSaleModalOpen(false);
      setSaleForm({
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        unitType: 'TRAY',
        quantityInUnit: '',
        unitPrice: '',
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ক্রেতা সংরক্ষণে সমস্যা হয়েছে');

      setFeedback({ type: 'success', message: 'নতুন ক্রেতা সফলভাবে যুক্ত হয়েছে!' });
      setIsCustomerModalOpen(false);
      setCustomerForm({
        name: '',
        businessName: '',
        phone: '',
        address: '',
        openingBalance: '0',
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

  const handleCustomerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerForPayment) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/customers/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerForPayment._id,
          amount: paymentForm.amount,
          paymentMethod: paymentForm.paymentMethod,
          transactionRef: paymentForm.transactionRef,
          notes: paymentForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'পেমেন্ট গ্রহণে সমস্যা হয়েছে');

      setFeedback({
        type: 'success',
        message: `${selectedCustomerForPayment.name} এর কাছ থেকে ৳${paymentForm.amount} সফলভাবে আদায় হয়েছে!`,
      });
      setIsPaymentModalOpen(false);
      setPaymentForm({ amount: '', paymentMethod: 'CASH', transactionRef: '', notes: '' });
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
                ডিম বিক্রয় ও কাস্টমার লেজার
              </h2>
              <Badge variant="emerald">সেলস ও রসিদ</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ডিম বিক্রয় চালান তৈরি, নগদ আদায় ও ক্রেতার বকেয়া হিসাব খতিয়ান
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCustomerModalOpen(true)}
              icon={<Users className="w-4 h-4" />}
            >
              নতুন ক্রেতা যোগ করুন
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsSaleModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              নতুন বিক্রয় চালান
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

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'sales'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            বিক্রয় চালান তালিকা ({toBengaliNumber(sales.length)})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'customers'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            ক্রেতা ও বকেয়া খতিয়ান ({toBengaliNumber(customers.length)})
          </button>
        </div>

        {/* TAB 1: Sales Invoices */}
        {activeTab === 'sales' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>ডিম বিক্রয় চালানসমূহ</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">সবগুলো বিক্রয় চালান ও আদায়ের রেকর্ড</p>
              </div>
            </CardHeader>

            {loading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sales.length === 0 ? (
              <EmptyState
                title="কোনো বিক্রয় চালান পাওয়া যায়নি"
                description="ডিম বিক্রয় রেকর্ড করতে নতুন বিক্রয় চালান বোতামে চাপুন।"
                action={
                  <Button
                    size="sm"
                    onClick={() => setIsSaleModalOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    প্রথম চালান তৈরি করুন
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                      <th className="py-3 px-4">চালান নং</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">ক্রেতার নাম</th>
                      <th className="py-3 px-4">পরিমাণ (একক)</th>
                      <th className="py-3 px-4">মোট ডিম</th>
                      <th className="py-3 px-4">দর (৳)</th>
                      <th className="py-3 px-4">মোট বিল (৳)</th>
                      <th className="py-3 px-4">পরিশোধ</th>
                      <th className="py-3 px-4">বকেয়া</th>
                      <th className="py-3 px-4 text-center">চালান রসিদ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                          {sale.invoiceNo}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {formatBengaliDate(sale.date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{sale.customerName}</div>
                          {sale.customerPhone && (
                            <div className="text-[11px] text-slate-400">{sale.customerPhone}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                          {toBengaliNumber(sale.quantityInUnit)}{' '}
                          {sale.unitType === 'TRAY'
                            ? 'ট্রে'
                            : sale.unitType === 'DOZEN'
                            ? 'ডজন'
                            : 'পিস'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {toBengaliNumber(sale.totalPieces)} টি
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-700">
                          {formatTaka(sale.unitPrice)}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold text-slate-900">
                          {formatTaka(sale.grandTotal)}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                          {formatTaka(sale.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {sale.dueAmount > 0 ? (
                            <span className="font-bold text-rose-600">
                              {formatTaka(sale.dueAmount)}
                            </span>
                          ) : (
                            <Badge variant="emerald">পরিশোধিত</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInvoiceToPrint(sale)}
                            title="রশিদ দেখুন ও প্রিন্ট করুন"
                            icon={<Printer className="w-4 h-4 text-slate-600" />}
                          >
                            প্রিন্ট
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: Customers & Dues */}
        {activeTab === 'customers' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>ক্রেতা তালিকা ও দেনা-পাওনা খতিয়ান</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি ক্রেতার মোট বিক্রয়, মোট পরিশোধ ও বর্তমান বকেয়া স্থিতি
                </p>
              </div>
            </CardHeader>

            {loading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : customers.length === 0 ? (
              <EmptyState
                title="কোনো ক্রেতা যুক্ত করা হয়নি"
                description="নিয়মিত ডিম পাইকারি বা খুচরা ক্রেতাদের তালিকা তৈরি করতে নতুন ক্রেতা বোতামে চাপুন।"
                action={
                  <Button
                    size="sm"
                    onClick={() => setIsCustomerModalOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    প্রথম ক্রেতা যোগ করুন
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                      <th className="py-3 px-4">ক্রেতার নাম ও ব্যবসা</th>
                      <th className="py-3 px-4">যোগাযোগ</th>
                      <th className="py-3 px-4">মোট কেনাকাটা</th>
                      <th className="py-3 px-4">মোট পরিশোধ</th>
                      <th className="py-3 px-4">বর্তমান বকেয়া স্থিতি</th>
                      <th className="py-3 px-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{c.name}</div>
                          {c.businessName && (
                            <div className="text-xs text-slate-500 font-medium">
                              {c.businessName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                          {c.address && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{c.address}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                          {formatTaka(c.totalPurchases || 0)}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                          {formatTaka(c.totalPaid || 0)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {c.currentDue > 0 ? (
                            <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                              {formatTaka(c.currentDue)} (বকেয়া)
                            </span>
                          ) : (
                            <Badge variant="emerald">কোনো বকেয়া নেই</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {c.currentDue > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomerForPayment(c);
                                setPaymentForm({
                                  amount: String(c.currentDue),
                                  paymentMethod: 'CASH',
                                  transactionRef: '',
                                  notes: '',
                                });
                                setIsPaymentModalOpen(true);
                              }}
                              icon={<CreditCard className="w-3.5 h-3.5" />}
                            >
                              টাকা আদায়
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Modal 1: New Egg Sale */}
      <Modal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        title="নতুন ডিম বিক্রয় চালান তৈরি করুন"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSale} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="ক্রেতা নির্বাচন করুন"
              value={saleForm.customerId}
              onChange={(e) => setSaleForm({ ...saleForm, customerId: e.target.value })}
              required
            >
              <option value="">-- ক্রেতা বাছাই করুন --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.businessName ? `(${c.businessName})` : ''} - বকেয়া:{' '}
                  {c.currentDue > 0 ? `৳${c.currentDue}` : '০'}
                </option>
              ))}
            </Select>

            <Input
              label="তারিখ"
              type="date"
              value={saleForm.date}
              onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="বিক্রয়ের একক"
              value={saleForm.unitType}
              onChange={(e) => setSaleForm({ ...saleForm, unitType: e.target.value })}
            >
              <option value="TRAY">ট্রে (১ ট্রে = {traySize}টি)</option>
              <option value="DOZEN">ডজন (১২টি)</option>
              <option value="PIECE">পিস (১টি)</option>
            </Select>

            <Input
              label="পরিমাণ"
              type="number"
              step="0.1"
              min="0.1"
              placeholder="যেমন: ৫০"
              value={saleForm.quantityInUnit}
              onChange={(e) => setSaleForm({ ...saleForm, quantityInUnit: e.target.value })}
              required
            />

            <Input
              label="প্রতি এককের দর (৳)"
              type="number"
              step="0.01"
              min="0"
              placeholder="যেমন: ৩৫০"
              value={saleForm.unitPrice}
              onChange={(e) => setSaleForm({ ...saleForm, unitPrice: e.target.value })}
              required
            />
          </div>

          {/* Live Calculation Summary */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-700">
              <span>মোট ডিমের সংখ্যা:</span>
              <strong className="text-emerald-900">{toBengaliNumber(totalPieces)} টি</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>মোট হিসাব (সাবটোটাল):</span>
              <span className="font-semibold">{formatTaka(subTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-bold border-t border-emerald-200 pt-1.5 text-sm">
              <span>সর্বমোট বিল (গ্র্যান্ড টোটাল):</span>
              <span className="text-emerald-950">{formatTaka(grandTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="ছাড় / ডিসকাউন্ট (৳)"
              type="number"
              min="0"
              value={saleForm.discount}
              onChange={(e) => setSaleForm({ ...saleForm, discount: e.target.value })}
            />

            <Input
              label="নগদ পরিশোধ (৳)"
              type="number"
              min="0"
              value={saleForm.paidAmount}
              onChange={(e) => setSaleForm({ ...saleForm, paidAmount: e.target.value })}
            />

            <Select
              label="পেমেন্টের মাধ্যম"
              value={saleForm.paymentMethod}
              onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
            >
              <option value="CASH">ক্যাশ / নগদ</option>
              <option value="BKASH">বিকাশ (bKash)</option>
              <option value="NAGAD">নগদ (Nagad)</option>
              <option value="BANK">ব্যাংক ট্রান্সফার</option>
              <option value="OTHER">অন্যান্য</option>
            </Select>
          </div>

          {dueAmount > 0 && (
            <div className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-lg border border-rose-200 flex justify-between">
              <span>ক্রেতার হিসাবে বকেয়া যোগ হবে:</span>
              <span>{formatTaka(dueAmount)}</span>
            </div>
          )}

          <Input
            label="মন্তব্য (ঐচ্ছিক)"
            placeholder="চালান সংক্রান্ত অতিরিক্ত তথ্য"
            value={saleForm.notes}
            onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSaleModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              চালান নিশ্চিত করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Create Customer */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="নতুন ক্রেতা নিবন্ধন করুন"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <Input
            label="ক্রেতার নাম"
            placeholder="যেমন: হাজী মোঃ দেলোয়ার হোসেন"
            value={customerForm.name}
            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
            required
          />

          <Input
            label="দোকান বা ব্যবসা প্রতিষ্ঠানের নাম"
            placeholder="যেমন: দেলোয়ার এগ ট্রেডার্স"
            value={customerForm.businessName}
            onChange={(e) => setCustomerForm({ ...customerForm, businessName: e.target.value })}
          />

          <Input
            label="মোবাইল নম্বর"
            placeholder="যেমন: 01711-XXXXXX"
            value={customerForm.phone}
            onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
            required
          />

          <Input
            label="ঠিকানা"
            placeholder="যেমন: কাপ্তান বাজার, ঢাকা"
            value={customerForm.address}
            onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
          />

          <Input
            label="পূর্বের বকেয়া (যদি থাকে ৳)"
            type="number"
            min="0"
            value={customerForm.openingBalance}
            onChange={(e) =>
              setCustomerForm({ ...customerForm, openingBalance: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsCustomerModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              ক্রেতা সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Customer Payment Collection */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="বকেয়া টাকা আদায় রসিদ"
      >
        <form onSubmit={handleCustomerPayment} className="space-y-4">
          {selectedCustomerForPayment && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-bold text-slate-800 text-sm">
                {selectedCustomerForPayment.name}
              </div>
              <div className="text-slate-600">
                বর্তমান মোট বকেয়া:{' '}
                <strong className="text-rose-600">
                  {formatTaka(selectedCustomerForPayment.currentDue)}
                </strong>
              </div>
            </div>
          )}

          <Input
            label="আদায়ের টাকার পরিমাণ (৳)"
            type="number"
            min="1"
            max={selectedCustomerForPayment?.currentDue}
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            required
          />

          <Select
            label="পেমেন্টের মাধ্যম"
            value={paymentForm.paymentMethod}
            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
          >
            <option value="CASH">ক্যাশ / নগদ</option>
            <option value="BKASH">বিকাশ (bKash)</option>
            <option value="NAGAD">নগদ (Nagad)</option>
            <option value="BANK">ব্যাংক ট্রান্সফার</option>
          </Select>

          <Input
            label="ট্রানজেকশন আইডি / রেফারেন্স (ঐচ্ছিক)"
            placeholder="যেমন: bKash TrxID বা চেক নম্বর"
            value={paymentForm.transactionRef}
            onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              টাকা গ্রহণ নিশ্চিত করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 4: Printable Invoice View */}
      {invoiceToPrint && (
        <Modal
          isOpen={true}
          onClose={() => setInvoiceToPrint(null)}
          title="ডিম বিক্রয় চালান রসিদ"
          maxWidth="lg"
        >
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 print:p-0">
            <div className="text-center border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-800">বিসমিল্লাহ লেয়ার ফার্ম</h2>
              <p className="text-xs text-slate-500">বাণিজ্যিক লেয়ার খামার</p>
              <h3 className="text-sm font-semibold text-emerald-800 mt-2">ডিম বিক্রয় মেমো / চালান</h3>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <div>
                <p>
                  <strong>চালান নং:</strong> {invoiceToPrint.invoiceNo}
                </p>
                <p>
                  <strong>ক্রেতার নাম:</strong> {invoiceToPrint.customerName}
                </p>
                {invoiceToPrint.customerPhone && (
                  <p>
                    <strong>ফোন:</strong> {invoiceToPrint.customerPhone}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p>
                  <strong>তারিখ:</strong> {formatBengaliDate(invoiceToPrint.date)}
                </p>
                <p>
                  <strong>পেমেন্ট মাধ্যম:</strong> {invoiceToPrint.paymentMethod}
                </p>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-200 mt-2">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                <tr>
                  <th className="p-2">বিবরণ</th>
                  <th className="p-2 text-right">পরিমাণ</th>
                  <th className="p-2 text-right">দর (৳)</th>
                  <th className="p-2 text-right">মোট (৳)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-2">
                    লেয়ার খামারের তাজা লাল ডিম (
                    {invoiceToPrint.unitType === 'TRAY'
                      ? 'ট্রে'
                      : invoiceToPrint.unitType === 'DOZEN'
                      ? 'ডজন'
                      : 'পিস'}
                    )
                  </td>
                  <td className="p-2 text-right">
                    {toBengaliNumber(invoiceToPrint.quantityInUnit)}{' '}
                    {invoiceToPrint.unitType === 'TRAY' ? 'ট্রে' : ''}
                  </td>
                  <td className="p-2 text-right">{formatTaka(invoiceToPrint.unitPrice)}</td>
                  <td className="p-2 text-right">{formatTaka(invoiceToPrint.subTotal)}</td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-end pt-2 text-xs">
              <div className="w-48 space-y-1">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>{formatTaka(invoiceToPrint.subTotal)}</span>
                </div>
                {invoiceToPrint.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>ছাড়:</span>
                    <span>-{formatTaka(invoiceToPrint.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-1">
                  <span>মোট বিল:</span>
                  <span>{formatTaka(invoiceToPrint.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>পরিশোধ:</span>
                  <span>{formatTaka(invoiceToPrint.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-rose-600 font-bold border-t border-slate-100 pt-1">
                  <span>বকেয়া:</span>
                  <span>{formatTaka(invoiceToPrint.dueAmount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between text-[11px] text-slate-400 border-t border-slate-100">
              <span>ক্রেতার স্বাক্ষর: _________________</span>
              <span>খামার পরিচালকের স্বাক্ষর: _________________</span>
            </div>

            <div className="pt-3 flex justify-end gap-2 print:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-4 h-4" />}
              >
                প্রিন্ট করুন
              </Button>
              <Button size="sm" onClick={() => setInvoiceToPrint(null)}>
                বন্ধ করুন
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
