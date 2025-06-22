'use client';

import UserAvatar from "./UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const { user } = useAuth();

  if (!user) {
    return (
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/painel">
                <Image
                  src="/logo-ai.svg"
                  alt="Tag Mage Logo"
                  width={150}
                  height={40}
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center">
              <UserAvatar />
            </div>
          </div>
        </div>
      </header>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/painel">
              <Image
                src="/logo-ai.svg"
                alt="Tag Mage Logo"
                width={150}
                height={40}
                priority
              />
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{userName}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <UserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
} 