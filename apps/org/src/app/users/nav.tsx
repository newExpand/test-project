'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function UserNav() {
  const pathname = usePathname();

  const links = [
    { href: '/users', label: '기본 캐싱 (ISR)' },
    { href: '/users/no-cache', label: '캐싱 없음' },
    { href: '/users/revalidate', label: '수동 재검증' },
  ];

  return (
    <nav className="bg-gray-100 p-4 rounded-md mb-6">
      <ul className="flex flex-wrap gap-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`px-3 py-1.5 rounded ${
                  isActive
                    ? 'bg-blue-500 text-white font-medium'
                    : 'bg-white hover:bg-gray-200'
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
