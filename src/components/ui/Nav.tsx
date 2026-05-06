'use client';
// src/components/ui/Nav.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const links = [
  { href: '/book', label: 'Book' },
  { href: '/my-spot', label: 'My spot' },
  { href: '/admin', label: 'Admin' },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-gray-100 bg-white">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="3" width="12" height="1.5" rx=".75" fill="white" />
              <rect x="1" y="6.5" width="8" height="1.5" rx=".75" fill="white" />
              <rect x="1" y="10" width="10" height="1.5" rx=".75" fill="white" />
            </svg>
          </div>
          <span className="font-medium text-gray-800 text-sm">QueueFlow</span>
        </Link>
        <div className="flex gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname.startsWith(href)
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
