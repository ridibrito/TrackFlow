'use client';

import { useAuth } from "@/contexts/AuthContext";
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ size = 'md' }: UserAvatarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };
  
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-20 w-20 text-3xl',
  };

  const currentSize = sizeClasses[size];

  if (!user) {
    return (
        <div className={`rounded-full bg-gray-200 flex items-center justify-center ${currentSize}`}>
          <UserCircleIcon className={`text-gray-400 w-5/6 h-5/6`} />
        </div>
    );
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || 'U';
  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className={`flex items-center rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 hover:bg-gray-200 transition-colors`}>
            <span className="sr-only">Abrir menu do usuário</span>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={userName}
                    className={`rounded-full object-cover ${currentSize}`}
                />
            ) : (
                <div className={`bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold ${currentSize}`}>
                    {userInitials}
                </div>
            )}
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/settings"
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                  >
                    <Cog6ToothIcon className="mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                    Configurações
                  </Link>
                )}
              </Menu.Item>
            </div>
            <div className="py-1">
               <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? 'bg-red-50 text-red-700' : 'text-gray-700'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors`}
                  >
                    <ArrowRightOnRectangleIcon className="mr-2 h-5 w-5 text-gray-400 group-hover:text-red-600" aria-hidden="true" />
                    Sair
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
} 
