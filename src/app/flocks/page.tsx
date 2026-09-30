'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, Skeleton } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatTaka, formatBengaliDate } from '@/lib/utils';
import { Layers, Plus, Warehouse, AlertCircle, CheckCircle } from 'lucide-react';
import { IUser } from '@/types';

export default function FlocksPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [sheds, setSheds] = useState<any[]>([]);
  const [flocks, setFlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isShedModalOpen, setIsShedModalOpen] = useState(false);
  const [isFlockModalOpen, setIsFlockModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Shed Form
  const [shedForm, setShedForm] = useState({
    name: '',
    code: '',
    capacity: '',
    type: 'LAYER',
    notes: '',
  });

  // Flock Form
  const [flockForm, setFlockForm] = useState({
    batchId: '',
    name: '',
    breed: 'হাইল্যাইন ব্রাউন (Hy-Line Brown)',
    supplier: '',
    shedId: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    ageInWeeksAtArrival: '16',
    initialBirdCount: '',
    purchaseCostPerBird: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      const [uRes, sRes, fRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sheds').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/flocks').then((r) => (r.ok ? r.json() : [])),
      ]);
      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(sRes)) setSheds(sRes);
      if (Array.isArray(fRes)) setFlocks(fRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateShed = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/sheds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shedForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'শেড তৈরিতে ব্যর্থ');

      setFeedback({ type: 'success', message: 'নতুন শেড সফলভাবে যুক্ত হয়েছে!' });
      setIsShedModalOpen(false);
      setShedForm({ name: '', code: '', capacity: '', type: 'LAYER', notes: '' });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/flocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flockForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ফ্লক তৈরিতে ব্যর্থ');

      setFeedback({ type: 'success', message: 'নতুন ফ্লক/ব্যাচ সফলভাবে শুরু হয়েছে!' });
      setIsFlockModalOpen(false);
      setFlockForm({
        batchId: '',
        name: '',
        breed: 'হাইল্যাইন ব্রাউন (Hy-Line Brown)',
        supplier: '',
        shedId: '',
        arrivalDate: new Date().toISOString().split('T')[0],
        ageInWeeksAtArrival: '16',
        initialBirdCount: '',
        purchaseCostPerBird: '',
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              শেড ও ফ্লক / ব্যাচ ব্যবস্থাপনা
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              খামারের শেড ধারণক্ষমতা এবং সক্রিয় ব্যাচসমূহের মুরগির সংখ্যা ও বয়স ট্র্যাকিং
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setFeedback(null);
                setIsShedModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              নতুন শেড যোগ করুন
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setFeedback(null);
                setIsFlockModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              নতুন ফ্লক / ব্যাচ শুরু করুন
            </Button>
          </div>
        </div>

        {/* Feedback message */}
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

        {/* Sheds Grid Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-emerald-700" />
              শেডসমূহ ({toBengaliNumber(sheds.length)}টি)
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
            </div>
          ) : sheds.length === 0 ? (
            <EmptyState
              title="কোনো শেড যুক্ত করা হয়নি"
              description="আপনার খামারের প্রথম শেড যুক্ত করতে উপরের বোতামটিতে ক্লিক করুন।"
              action={
                <Button
                  size="sm"
                  onClick={() => setIsShedModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  প্রথম শেড যোগ করুন
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sheds.map((shed) => {
                const occupancyPercent =
                  shed.capacity > 0
                    ? Math.min(100, Math.round(((shed.currentOccupancy || 0) / shed.capacity) * 100))
                    : 0;

                return (
                  <Card key={shed._id} className="relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-base">{shed.name}</h4>
                          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {shed.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">ধরন: {shed.type}</p>
                      </div>
                      <Badge variant={shed.status === 'ACTIVE' ? 'emerald' : 'slate'}>
                        {shed.status === 'ACTIVE' ? 'সক্রিয়' : 'খালি / মেরামত'}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <span>বর্তমান মুরগি: {toBengaliNumber(shed.currentOccupancy || 0)}টি</span>
                        <span>ধারণক্ষমতা: {toBengaliNumber(shed.capacity)}টি</span>
                      </div>
                      {/* Capacity Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occupancyPercent > 90
                              ? 'bg-rose-500'
                              : occupancyPercent > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          সক্রিয় ব্যাচ:{' '}
                          {shed.activeFlock ? (
                            <strong className="text-slate-700">{shed.activeFlock.name}</strong>
                          ) : (
                            <span className="text-slate-400">খালি</span>
                          )}
                        </span>
                        <span>{toBengaliNumber(occupancyPercent)}% পূর্ণ</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Flocks Table Section */}
        <Card className="mt-6">
          <CardHeader>
            <div>
              <CardTitle>ফ্লক ও মুরগির ব্যাচ তালিকা</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                প্রতিটি ব্যাচের আগমন তারিখ, বর্তমান বয়স ও মুরগির সংখ্যার সঠিক হিসাব
              </p>
            </div>
            <span className="text-xs text-slate-500">
              মোট ব্যাচ: <strong>{toBengaliNumber(flocks.length)}</strong> টি
            </span>
          </CardHeader>

          {loading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : flocks.length === 0 ? (
            <EmptyState
              title="কোনো ফ্লক / ব্যাচ শুরু করা হয়নি"
              description="ডিম উৎপাদন ও খাদ্য হিসাব পরিচালনা করতে একটি নতুন ফ্লক তৈরি করুন।"
              action={
                <Button
                  size="sm"
                  onClick={() => setIsFlockModalOpen(true)}
                  icon={<Plus className="w-4 h-4" />}
                >
                  নতুন ব্যাচ শুরু করুন
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">ব্যাচ আইডি ও নাম</th>
                    <th className="py-3 px-4">জাত (Breed)</th>
                    <th className="py-3 px-4">নির্ধারিত শেড</th>
                    <th className="py-3 px-4">আগমন তারিখ</th>
                    <th className="py-3 px-4">বর্তমান বয়স</th>
                    <th className="py-3 px-4">প্রাথমিক মুরগি</th>
                    <th className="py-3 px-4">বর্তমান সংখ্যা</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {flocks.map((flock) => (
                    <tr key={flock._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{flock.name}</div>
                        <div className="text-xs font-mono text-emerald-700">{flock.batchId}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">{flock.breed}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {flock.shedName}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {formatBengaliDate(flock.arrivalDate)}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-emerald-800">
                        {flock.ageText}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {toBengaliNumber(flock.initialBirdCount)} টি
                      </td>
                      <td className="py-3 px-4 text-sm font-bold text-slate-900">
                        {toBengaliNumber(flock.currentBirdCount)} টি
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={flock.status === 'ACTIVE' ? 'emerald' : 'slate'}>
                          {flock.status === 'ACTIVE' ? 'উৎপাদনশীল' : 'বন্ধ'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modal 1: Create Shed */}
      <Modal
        isOpen={isShedModalOpen}
        onClose={() => setIsShedModalOpen(false)}
        title="নতুন শেড তৈরি করুন"
      >
        <form onSubmit={handleCreateShed} className="space-y-4">
          <Input
            label="শেডের নাম"
            placeholder="যেমন: শেড নং ০১ (লেয়ার শেড)"
            value={shedForm.name}
            onChange={(e) => setShedForm({ ...shedForm, name: e.target.value })}
            required
          />
          <Input
            label="শেড কোড (অনন্য কোড)"
            placeholder="যেমন: SHED-01"
            value={shedForm.code}
            onChange={(e) => setShedForm({ ...shedForm, code: e.target.value })}
            required
          />
          <Input
            label="ধারণক্ষমতা (মোট মুরগির সংখ্যা)"
            type="number"
            min="1"
            placeholder="যেমন: ৫০০০"
            value={shedForm.capacity}
            onChange={(e) => setShedForm({ ...shedForm, capacity: e.target.value })}
            required
          />
          <Select
            label="শেডের ধরন"
            value={shedForm.type}
            onChange={(e) => setShedForm({ ...shedForm, type: e.target.value })}
          >
            <option value="LAYER">লেয়ার শেড (ডিম উৎপাদনকারী)</option>
            <option value="GROWER">গ্রোয়ার শেড</option>
            <option value="BROODER">ব্রুডার শেড</option>
            <option value="GENERAL">সাধারণ শেড</option>
          </Select>
          <Input
            label="মন্তব্য (ঐচ্ছিক)"
            placeholder="শেড সংক্রান্ত বিশেষ নোট"
            value={shedForm.notes}
            onChange={(e) => setShedForm({ ...shedForm, notes: e.target.value })}
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsShedModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              শেড সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Create Flock */}
      <Modal
        isOpen={isFlockModalOpen}
        onClose={() => setIsFlockModalOpen(false)}
        title="নতুন ফ্লক / ব্যাচ শুরু করুন"
      >
        <form onSubmit={handleCreateFlock} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="ব্যাচ আইডি (Unique ID)"
              placeholder="যেমন: BATCH-2026-A"
              value={flockForm.batchId}
              onChange={(e) => setFlockForm({ ...flockForm, batchId: e.target.value })}
              required
            />
            <Input
              label="ব্যাচের নাম"
              placeholder="যেমন: লেয়ার ব্যাচ ১"
              value={flockForm.name}
              onChange={(e) => setFlockForm({ ...flockForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="মুরগির জাত (Breed)"
              value={flockForm.breed}
              onChange={(e) => setFlockForm({ ...flockForm, breed: e.target.value })}
              required
            >
              <option value="হাইল্যাইন ব্রাউন (Hy-Line Brown)">হাইল্যাইন ব্রাউন (Hy-Line Brown)</option>
              <option value="লোহম্যান ব্রাউন (Lohmann Brown)">লোহম্যান ব্রাউন (Lohmann Brown)</option>
              <option value="নোভোজেন ব্রাউন (Novogen Brown)">নোভোজেন ব্রাউন (Novogen Brown)</option>
              <option value="বোভানস হোয়াইট (Bovans White)">বোভানস হোয়াইট (Bovans White)</option>
              <option value="অন্যান্য জাত">অন্যান্য জাত</option>
            </Select>

            <Select
              label="শেড নির্বাচন করুন"
              value={flockForm.shedId}
              onChange={(e) => setFlockForm({ ...flockForm, shedId: e.target.value })}
              required
            >
              <option value="">-- শেড বাছাই করুন --</option>
              {sheds.map((shed) => (
                <option key={shed._id} value={shed._id}>
                  {shed.name} ({shed.code}) - ধারণক্ষমতা: {shed.capacity}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="আগমনের তারিখ"
              type="date"
              value={flockForm.arrivalDate}
              onChange={(e) => setFlockForm({ ...flockForm, arrivalDate: e.target.value })}
              required
            />
            <Input
              label="আগমনের সময় বয়স (সপ্তাহ)"
              type="number"
              min="0"
              value={flockForm.ageInWeeksAtArrival}
              onChange={(e) =>
                setFlockForm({ ...flockForm, ageInWeeksAtArrival: e.target.value })
              }
              required
            />
            <Input
              label="প্রাথমিক মুরগি সংখ্যা"
              type="number"
              min="1"
              placeholder="যেমন: ৩০০০"
              value={flockForm.initialBirdCount}
              onChange={(e) =>
                setFlockForm({ ...flockForm, initialBirdCount: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="সরবরাহকারী / হ্যাচারি"
              placeholder="যেমন: আফতাব বহুমুখী ফার্মস"
              value={flockForm.supplier}
              onChange={(e) => setFlockForm({ ...flockForm, supplier: e.target.value })}
            />
            <Input
              label="প্রতি মুরগির ক্রয়মূল্য (৳)"
              type="number"
              min="0"
              placeholder="যেমন: ৩৫০"
              value={flockForm.purchaseCostPerBird}
              onChange={(e) =>
                setFlockForm({ ...flockForm, purchaseCostPerBird: e.target.value })
              }
            />
          </div>

          <Input
            label="মন্তব্য (ঐচ্ছিক)"
            placeholder="টিকা বা প্রাথমিক স্বাস্থ্য সংক্রান্ত তথ্য"
            value={flockForm.notes}
            onChange={(e) => setFlockForm({ ...flockForm, notes: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFlockModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              ব্যাচ শুরু করুন
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
