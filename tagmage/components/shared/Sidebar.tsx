'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import UserAvatar from '@/components/shared/UserAvatar';

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center justify-center border-b border-gray-200 px-6">
          <Link href="/painel" className="flex items-center space-x-3">
            <Image
              src="/logo_tagmage.png"
              alt="Tag Mage Logo"
              width={150}
              height={100}
              priority
            />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {children}
        </div>
        
      </div>
    </aside>
  );
}

interface SidebarItemProps {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isActive?: boolean;
}

export function SidebarItem({ href, icon, children, isActive = false }: SidebarItemProps) {
  const baseClasses = 'flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200';
  const activeClasses = isActive 
    ? 'text-white bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md' 
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
  
  const iconClasses = isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500';

  return (
    <Link href={href} className={`group ${baseClasses} ${activeClasses}`}>
      {icon && <span className={`mr-3 h-5 w-5 ${iconClasses}`}>{icon}</span>}
      <span>{children}</span>
    </Link>
  );
} 