'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import Sidebar from '@/components/shared/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <div className="flex h-screen bg-gray-100">
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed">
                <Sidebar />
            </div>
            <div className="md:pl-64 flex flex-col flex-1">
                <DashboardHeader />
                <main className="flex-1">
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    </AuthProvider>
  );
} 