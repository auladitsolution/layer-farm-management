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
import { Users, Plus, Phone, Calendar, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { IUser } from '@/types';

export default function EmployeesPage() {
  const [user, setUser] = useState<IUser | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    phone: '',
    role: 'শেড সুপারভাইজার / কেয়ারটেকার',
    monthlySalary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: '',
    status: 'ACTIVE',
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchData = async () => {
    try {
      const [uRes, eRes] = await Promise.all([
        fetch('/api/auth/me').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/employees').then((r) => (r.ok ? r.json() : [])),
      ]);
      if (uRes?.user) setUser(uRes.user);
      if (Array.isArray(eRes)) setEmployees(eRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'কর্মী সংরক্ষণ ব্যর্থ হয়েছে');

      setFeedback({ type: 'success', message: 'নতুন কর্মী সফলভাবে যুক্ত হয়েছে!' });
      setIsModalOpen(false);
      setEmployeeForm({
        name: '',
        phone: '',
        role: 'শেড সুপারভাইজার / কেয়ারটেকার',
        monthlySalary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        address: '',
        status: 'ACTIVE',
      });
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ত্রুটি হয়েছে';
      setFeedback({ type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const totalMonthlyPayroll = employees.reduce((s, e) => s + (e.monthlySalary || 0), 0);

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
                খামার কর্মী ব্যবস্থাপনা
              </h2>
              <Badge variant="emerald">টিম ও পেরোল</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              ফার্ম সুপারভাইজার, খাদ্য ও ডিম সংগ্রহ কর্মী এবং মাসিক বেতন সংক্রান্ত খতিয়ান
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            নতুন কর্মী যুক্ত করুন
          </Button>
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

        {/* Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-emerald-50/40 border-emerald-200">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              মোট সক্রিয় কর্মী
            </span>
            <div className="mt-2 text-3xl font-black text-emerald-950">
              {toBengaliNumber(employees.filter((e) => e.status === 'ACTIVE').length)}{' '}
              <span className="text-sm font-normal text-slate-500">জন</span>
            </div>
          </Card>

          <Card className="bg-sky-50/40 border-sky-200">
            <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider block">
              মাসিক সর্বমোট বেতন বাজেট
            </span>
            <div className="mt-2 text-3xl font-black text-sky-950">
              {formatTaka(totalMonthlyPayroll)}
            </div>
          </Card>
        </div>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>কর্মীদের তালিকা</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">দায়িত্ব ও বেতন বিবরণী</p>
            </div>
          </CardHeader>

          {loading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : employees.length === 0 ? (
            <EmptyState
              title="কোনো কর্মী যোগ করা হয়নি"
              description="খামারের কর্মীদের প্রোফাইল তৈরি করতে উপরের বোতামে চাপুন।"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold text-xs">
                    <th className="py-3 px-4">নাম ও পদবী</th>
                    <th className="py-3 px-4">মোবাইল</th>
                    <th className="py-3 px-4">যোগদানের তারিখ</th>
                    <th className="py-3 px-4">ঠিকানা</th>
                    <th className="py-3 px-4">মাসিক বেতন (৳)</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{e.name}</div>
                        <div className="text-xs text-emerald-700 font-medium">{e.role}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{e.phone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {formatBengaliDate(e.joiningDate)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">{e.address || '—'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {formatTaka(e.monthlySalary)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={e.status === 'ACTIVE' ? 'emerald' : 'slate'}>
                          {e.status === 'ACTIVE' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
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

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="নতুন কর্মী নিবন্ধন করুন"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <Input
            label="কর্মীর নাম"
            placeholder="যেমন: মোঃ জাহিদ হাসান"
            value={employeeForm.name}
            onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="মোবাইল নম্বর"
              placeholder="01711-XXXXXX"
              value={employeeForm.phone}
              onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              required
            />
            <Input
              label="পদবী / ভূমিকা"
              placeholder="যেমন: ফিড ম্যানেজার"
              value={employeeForm.role}
              onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="মাসিক বেতন (৳)"
              type="number"
              min="0"
              placeholder="যেমন: ১৬০০০"
              value={employeeForm.monthlySalary}
              onChange={(e) =>
                setEmployeeForm({ ...employeeForm, monthlySalary: e.target.value })
              }
              required
            />
            <Input
              label="যোগদানের তারিখ"
              type="date"
              value={employeeForm.joiningDate}
              onChange={(e) =>
                setEmployeeForm({ ...employeeForm, joiningDate: e.target.value })
              }
              required
            />
          </div>

          <Input
            label="স্থায়ী / বর্তমান ঠিকানা"
            placeholder="গ্রাম, থানা, জেলা"
            value={employeeForm.address}
            onChange={(e) => setEmployeeForm({ ...employeeForm, address: e.target.value })}
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              বাতিল
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              কর্মী সংরক্ষণ করুন
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
