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
  farmName = 'আওলাদ পোল্ট্রি ফার্ম',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
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
