'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatBengaliDate } from '@/lib/utils';
import {
  Syringe,
  Plus,
  Pill,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
} from 'lucide-react';
import { IUser } from '@/types';

export default function HealthPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [activeTab, setActiveTab] = useState<'vaccines' | 'medicines' | 'mortality'>('vaccines');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [mortalityRecords, setMortalityRecords] = useState<any[]>([]);
  const [flocks, setFlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isMortalityModalOpen, setIsMortalityModalOpen] = useState(false);
  const [selectedScheduleToComplete, setSelectedScheduleToComplete] = useState<any>(null);

  // Forms
  const [scheduleForm, setScheduleForm] = useState({
    flockId: '',
    vaccineName: 'রানীক্ষেত ও আইবি (ND + IB)',
    targetBirdAgeWeeks: '18',
    scheduledDate: new Date().toISOString().split('T')[0],
    dose: '১ ডোজ',
    route: 'DRINKING_WATER',
    notes: '',
  });

  const [medicineForm, setMedicineForm] = useState({
    name: '',
    type: 'VACCINE',
    brand: '',
    unit: 'ভায়াল',
    currentStock: '10',
    lowStockThreshold: '3',
    expiryDate: '',
    notes: '',
  });

  const [mortalityForm, setMortalityForm] = useState({
    date: new Date().toISOString().split('T')[0],
    flockId: '',
    deadCount: '',
    suspectedReason: 'স্বাভাবিক',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, vRes, mRes, mortRes, fRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/health/vaccinations').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/health/medicines').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/health/mortality').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/flocks?status=ACTIVE').then((r) => (r.ok ? r.json() : [])),
      ]);

      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(vRes)) setSchedules(vRes);
      if (Array.isArray(mRes)) setMedicines(mRes);
      if (Array.isArray(mortRes)) setMortalityRecords(mortRes);
      if (Array.isArray(fRes)) {
        setFlocks(fRes);
        if (fRes.length > 0) {
          setScheduleForm((prev) => ({ ...prev, flockId: fRes[0]._id }));
          setMortalityForm((prev) => ({ ...prev, flockId: fRes[0]._id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/health/vaccinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'কর্মসূচি সংরক্ষণ ব্যর্থ');

      setFeedback({ type: 'success', message: 'টিকার সময়সূচি সফলভাবে তৈরি হয়েছে!' });
      setIsScheduleModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteSchedule = async (id: string) => {
    try {
      const res = await fetch('/api/health/vaccinations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: id, status: 'COMPLETED' }),
      });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'টিকাদান সম্পন্ন হিসেবে চিহ্নিত হয়েছে!' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/health/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicineForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ওষুধ সংরক্ষণ ব্যর্থ');

      setFeedback({ type: 'success', message: 'নতুন ওষুধ/ভ্যাকসিন স্টকে যুক্ত হয়েছে!' });
      setIsMedicineModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateMortality = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/health/mortality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mortalityForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'মৃত্যু রেকর্ড সংরক্ষণ ব্যর্থ');

      setFeedback({
        type: 'success',
        message: 'মৃত্যু রেকর্ড সংরক্ষণ করা হয়েছে এবং ফ্লকের মুরগির সংখ্যা হালনাগাদ হয়েছে!',
      });
      setIsMortalityModalOpen(false);
      setMortalityForm({
        date: new Date().toISOString().split('T')[0],
        flockId: flocks[0]?._id || '',
        deadCount: '',
        suspectedReason: 'স্বাভাবিক',
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
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                ওষুধ, টিকাদান ও স্বাস্থ্য পর্যবেক্ষণ
              </h2>
              <Badge variant="emerald">ভেটেরিনারি ম্যানেজমেন্ট</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              টিকাদান কর্মসূচি ক্যালেন্ডার, মেডিসিন স্টক ট্র্যাকিং এবং মৃত্যুহার বিশ্লেষণ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsMortalityModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              মৃত্যু রেকর্ড এন্ট্রি
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsScheduleModalOpen(true)}
              icon={<Syringe className="w-4 h-4" />}
            >
              টিকার সূচি যোগ করুন
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
            onClick={() => setActiveTab('vaccines')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'vaccines'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Syringe className="w-4 h-4" />
            টিকাদান কর্মসূচি ({toBengaliNumber(schedules.length)})
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'medicines'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4" />
            ওষুধ ও ভ্যাকসিন স্টক ({toBengaliNumber(medicines.length)})
          </button>
          <button
            onClick={() => setActiveTab('mortality')}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'mortality'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            মৃত্যুহার রেকর্ড ({toBengaliNumber(mortalityRecords.length)})
          </button>
        </div>

        {/* TAB 1: Vaccination Schedule */}
        {activeTab === 'vaccines' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>নির্ধারিত টিকাদান কর্মসূচি</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  ফ্লকের বয়স অনুযায়ী টিকা প্রয়োগের সময়সূচি ও প্রয়োগ স্ট্যাটাস
                </p>
              </div>
            </CardHeader>

            {loading ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : schedules.length === 0 ? (
              <EmptyState
                title="কোনো টিকাদান সূচি নির্ধারিত নেই"
                description="ফ্লকের স্বাস্থ্য সুরক্ষায় আসন্ন ভ্যাকসিনের সূচি যুক্ত করুন।"
                action={
                  <Button
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(true)}
                    icon={<Plus className="w-4 h-4" />}
                  >
                    প্রথম টিকার সূচি তৈরি করুন
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                      <th className="py-3 px-4">নির্ধারিত তারিখ</th>
                      <th className="py-3 px-4">ফ্লক / ব্যাচ</th>
                      <th className="py-3 px-4">টিকার নাম</th>
                      <th className="py-3 px-4">লক্ষ্য বয়স</th>
                      <th className="py-3 px-4">প্রয়োগের মাধ্যম</th>
                      <th className="py-3 px-4">মাত্রা (Dose)</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-center">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-xs text-slate-800">
                          {formatBengaliDate(s.scheduledDate)}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-800">
                          {s.flockName}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{s.vaccineName}</td>
                        <td className="py-3 px-4 text-xs text-slate-600 font-semibold">
                          {toBengaliNumber(s.targetBirdAgeWeeks)} সপ্তাহ
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">
                          {s.route === 'DRINKING_WATER'
                            ? 'খাওয়ার পানি'
                            : s.route === 'EYE_DROP'
                            ? 'চোখে ড্রপ'
                            : s.route === 'INJECTION'
                            ? 'ইনজেকশন'
                            : 'স্প্রে'}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{s.dose}</td>
                        <td className="py-3 px-4">
                          <Badge variant={s.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                            {s.status === 'COMPLETED' ? '✓ সম্পন্ন' : 'অপেক্ষমান'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteSchedule(s._id)}
                            >
                              সম্পন্ন করুন
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

        {/* TAB 2: Medicines */}
        {activeTab === 'medicines' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsMedicineModalOpen(true)}
                icon={<Plus className="w-4 h-4" />}
              >
                নতুন ওষুধ যোগ করুন
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((m) => {
                const isLow = m.currentStock <= m.lowStockThreshold;

                return (
                  <Card key={m._id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{m.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">প্রস্তুতকারক: {m.brand}</p>
                      </div>
                      <Badge variant={isLow ? 'rose' : 'emerald'}>
                        {isLow ? 'স্টক কম!' : 'পর্যাপ্ত'}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-baseline justify-between">
                        <span>বর্তমান মজুদ:</span>
                        <span className="text-xl font-bold text-slate-900">
                          {toBengaliNumber(m.currentStock)} {m.unit}
                        </span>
                      </div>
                      {m.expiryDate && (
                        <div className="flex justify-between text-amber-700 font-medium">
                          <span>মেয়াদোত্তীর্ণের তারিখ:</span>
                          <span>{formatBengaliDate(m.expiryDate)}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: Mortality Records */}
        {activeTab === 'mortality' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>মৃত্যুহার ও কারণ বিশ্লেষণ</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিদিনের মুরগির মৃত্যু সংখ্যা ও সম্ভাব্য কারণসমূহ
                </p>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">ফ্লক / ব্যাচ</th>
                    <th className="py-3 px-4">মৃত মুরগির সংখ্যা</th>
                    <th className="py-3 px-4">সম্ভাব্য কারণ</th>
                    <th className="py-3 px-4">মন্তব্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mortalityRecords.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {formatBengaliDate(m.date)}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-800">{m.flockName}</td>
                      <td className="py-3 px-4 font-bold text-rose-600">
                        {toBengaliNumber(m.deadCount)} টি
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {m.suspectedReason}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{m.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal 1: Add Vaccine Schedule */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="নতুন টিকার সূচি নির্ধারণ করুন"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <Select
            label="ফ্লক নির্বাচন করুন"
            value={scheduleForm.flockId}
            onChange={(e) => setScheduleForm({ ...scheduleForm, flockId: e.target.value })}
            required
          >
            <option value="">-- ফ্লক বাছাই করুন --</option>
            {flocks.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name} ({f.batchId})
              </option>
            ))}
          </Select>

          <Input
            label="টিকার নাম"
            placeholder="যেমন: রানীক্ষেত ও আইবি (ND + IB)"
            value={scheduleForm.vaccineName}
            onChange={(e) => setScheduleForm({ ...scheduleForm, vaccineName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="নির্ধারিত তারিখ"
              type="date"
              value={scheduleForm.scheduledDate}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })
              }
              required
            />
            <Input
              label="মুরগির লক্ষ্য বয়স (সপ্তাহ)"
              type="number"
              min="0"
              value={scheduleForm.targetBirdAgeWeeks}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, targetBirdAgeWeeks: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="প্রয়োগের মাধ্যম"
              value={scheduleForm.route}
              onChange={(e) => setScheduleForm({ ...scheduleForm, route: e.target.value })}
            >
              <option value="DRINKING_WATER">খাওয়ার পানিতে</option>
              <option value="EYE_DROP">চোখের ড্রপ</option>
              <option value="INJECTION">ইনজেকশন</option>
              <option value="WING_WEB">পাখার চামড়ায়</option>
              <option value="SPRAY">স্প্রে</option>
            </Select>

            <Input
              label="মাত্রা (Dose)"
              value={scheduleForm.dose}
              onChange={(e) => setScheduleForm({ ...scheduleForm, dose: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              সূচি সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Add Medicine */}
      <Modal
        isOpen={isMedicineModalOpen}
        onClose={() => setIsMedicineModalOpen(false)}
        title="নতুন ওষুধ বা ভ্যাকসিন যুক্ত করুন"
      >
        <form onSubmit={handleCreateMedicine} className="space-y-4">
          <Input
            label="ওষুধের নাম"
            placeholder="যেমন: ভিটামিন এডি৩ই (AD3E)"
            value={medicineForm.name}
            onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
            required
          />
          <Input
            label="প্রস্তুতকারক কোম্পানি / ব্র্যান্ড"
            placeholder="যেমন: স্কয়ার / রেনাটা"
            value={medicineForm.brand}
            onChange={(e) => setMedicineForm({ ...medicineForm, brand: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="মজুদ পরিমাণ"
              type="number"
              min="0"
              value={medicineForm.currentStock}
              onChange={(e) => setMedicineForm({ ...medicineForm, currentStock: e.target.value })}
              required
            />
            <Input
              label="একক"
              placeholder="ভায়াল / প্যাকেট / মিলি"
              value={medicineForm.unit}
              onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
              required
            />
          </div>
          <Input
            label="মেয়াদোত্তীর্ণের তারিখ"
            type="date"
            value={medicineForm.expiryDate}
            onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsMedicineModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              ওষুধ সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Record Mortality */}
      <Modal
        isOpen={isMortalityModalOpen}
        onClose={() => setIsMortalityModalOpen(false)}
        title="মৃত্যু সংখ্যা রেকর্ড করুন"
      >
        <form onSubmit={handleCreateMortality} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="তারিখ"
              type="date"
              value={mortalityForm.date}
              onChange={(e) => setMortalityForm({ ...mortalityForm, date: e.target.value })}
              required
            />
            <Select
              label="ফ্লক নির্বাচন করুন"
              value={mortalityForm.flockId}
              onChange={(e) => setMortalityForm({ ...mortalityForm, flockId: e.target.value })}
              required
            >
              {flocks.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name} (বর্তমান: {f.currentBirdCount}টি)
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="মৃত মুরগির সংখ্যা"
            type="number"
            min="1"
            placeholder="যেমন: ৩"
            value={mortalityForm.deadCount}
            onChange={(e) => setMortalityForm({ ...mortalityForm, deadCount: e.target.value })}
            required
          />

          <Input
            label="সম্ভাব্য বা দৃশ্যমান কারণ"
            placeholder="যেমন: অতিরিক্ত গরম, স্বাভাবিক দুর্বলতা"
            value={mortalityForm.suspectedReason}
            onChange={(e) =>
              setMortalityForm({ ...mortalityForm, suspectedReason: e.target.value })
            }
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsMortalityModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              রেকর্ড সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
