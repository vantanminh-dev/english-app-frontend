import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // If not loading and not authenticated, show auth modal
    if (!isLoading && !isAuthenticated) {
      setIsAuthModalOpen(true);
    } else if (isAuthenticated) {
      setIsAuthModalOpen(false);
    }
  }, [isLoading, isAuthenticated]);

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        children
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access this feature.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Login or Register
          </button>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView="login"
      />
    </>
  );
};

export default AuthGuard; 