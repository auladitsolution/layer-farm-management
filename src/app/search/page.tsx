'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, EmptyState } from '@/components/ui/Skeleton';
import { toBengaliNumber, formatTaka, formatBengaliDate } from '@/lib/utils';
import {
  Search,
  Layers,
  Users,
  Building2,
  ShoppingCart,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { IUser } from '@/types';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [user, setUser] = useState<IUser | null>(null);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      });
  }, []);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setResults(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [query]);

  const flocks = results?.flocks || [];
  const customers = results?.customers || [];
  const suppliers = results?.suppliers || [];
  const sales = results?.sales || [];
  const purchases = results?.purchases || [];
  const employees = results?.employees || [];

  const totalResults =
    flocks.length +
    customers.length +
    suppliers.length +
    sales.length +
    purchases.length +
    employees.length;

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                অনুসন্ধানের ফলাফল: &ldquo;{query}&rdquo;
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                মোট {toBengaliNumber(totalResults)}টি প্রাসঙ্গিক তথ্য পাওয়া গেছে
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : totalResults === 0 ? (
          <EmptyState
            title="কোনো তথ্য পাওয়া যায়নি"
            description={`"${query}" সম্পর্কিত কোনো ফ্লক, ক্রেতা, চালান বা কর্মীর সন্ধান পাওয়া যায়নি।`}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flocks */}
            {flocks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    ফ্লক / ব্যাচ ({toBengaliNumber(flocks.length)})
                  </CardTitle>
                  <Link href="/flocks" className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    দেখুন <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <div className="divide-y divide-slate-100 text-xs">
                  {flocks.map((f: any) => (
                    <div key={f._id} className="py-2 flex justify-between">
                      <span className="font-semibold text-slate-800">{f.name} ({f.batchId})</span>
                      <span className="text-slate-500">{toBengaliNumber(f.currentBirdCount)}টি মুরগি</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Customers */}
            {customers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    ক্রেতা ({toBengaliNumber(customers.length)})
                  </CardTitle>
                  <Link href="/sales" className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    দেখুন <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <div className="divide-y divide-slate-100 text-xs">
                  {customers.map((c: any) => (
                    <div key={c._id} className="py-2 flex justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{c.name}</div>
                        <div className="text-slate-400">{c.phone}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-600">{formatTaka(c.currentDue)}</span>
                        <div className="text-[10px] text-slate-400">বকেয়া</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Sales Invoices */}
            {sales.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-700" />
                    ডিম বিক্রয় চালান ({toBengaliNumber(sales.length)})
                  </CardTitle>
                  <Link href="/sales" className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    দেখুন <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <div className="divide-y divide-slate-100 text-xs">
                  {sales.map((s: any) => (
                    <div key={s._id} className="py-2 flex justify-between">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{s.invoiceNo}</span>
                        <span className="text-slate-500 ml-2">({s.customerName})</span>
                      </div>
                      <span className="font-bold text-emerald-700">{formatTaka(s.grandTotal)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Suppliers */}
            {suppliers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    সরবরাহকারী ({toBengaliNumber(suppliers.length)})
                  </CardTitle>
                  <Link href="/feed" className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    দেখুন <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </CardHeader>
                <div className="divide-y divide-slate-100 text-xs">
                  {suppliers.map((sup: any) => (
                    <div key={sup._id} className="py-2 flex justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{sup.name}</div>
                        <div className="text-slate-400">{sup.phone}</div>
                      </div>
                      <span className="font-bold text-rose-600">{formatTaka(sup.currentPayable)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">লোড হচ্ছে...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
