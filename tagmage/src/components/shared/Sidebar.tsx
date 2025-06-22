'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  Cog6ToothIcon,
  FolderIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/painel', icon: ChartBarIcon },
  { name: 'Meus Projetos', href: '/projects', icon: FolderIcon },
  { name: 'Novo Projeto com IA', href: '/auto-create', icon: SparklesIcon },
];

const secondaryNavigation = [
    { name: 'Configurações', href: '/settings', icon: Cog6ToothIcon },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  if (!user) {
    return null; // Don't render sidebar if user is not logged in
  }

  return (
    <div className="flex flex-col gap-y-5 border-r border-gray-200 bg-white px-6 pb-4 w-64 flex-shrink-0 h-full">
      <nav className="flex flex-1 flex-col pt-8">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      pathname.startsWith(item.href)
                        ? 'bg-[#008EF9] text-white'
                        : 'text-gray-700 hover:text-[#008EF9] hover:bg-gray-50',
                      'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    )}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <ul role="list" className="-mx-2 space-y-1">
                {secondaryNavigation.map((item) => (
                    <li key={item.name}>
                    <Link
                        href={item.href}
                        className={classNames(
                        pathname.startsWith(item.href)
                            ? 'bg-[#008EF9] text-white'
                            : 'text-gray-700 hover:text-[#008EF9] hover:bg-gray-50',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                        )}
                    >
                        <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                        {item.name}
                    </Link>
                    </li>
                ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
} 