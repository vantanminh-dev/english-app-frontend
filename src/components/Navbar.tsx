'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-2 text-xl font-semibold text-gray-900"
            >
              English Dictionary
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/vocab-lists"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/vocab-lists'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Vocabulary Lists
            </Link>
            <Link
              href="/popular"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/popular'
                  ? 'text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Popular Words
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
