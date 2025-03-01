'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');

  const openLoginModal = () => {
    setAuthModalView('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalView('register');
    setIsAuthModalOpen(true);
  };

  return (
    <>
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

              {isAuthenticated ? (
                <div className="relative ml-3 flex items-center">
                  <span className="text-sm text-gray-700 mr-2">
                    {user?.username}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={openLoginModal}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView}
      />
    </>
  );
}
