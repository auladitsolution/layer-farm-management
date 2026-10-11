'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { IUser } from '@/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: IUser | null;
  farmName?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  user,
  farmName = 'বিসমিল্লাহ লেয়ার ফার্ম',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 ambient-bg relative overflow-x-hidden">
      {/* Ambient background light orbs */}
      <div className="fixed top-0 right-0 w-[500px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-1/3 w-[450px] h-[300px] bg-teal-500/4 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Desktop Sidebar */}
      <Sidebar userRole={user?.role} farmName={farmName} />

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={user?.role}
        farmName={farmName}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          farmName={farmName}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

