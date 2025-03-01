import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose,
  initialView = 'login'
}) => {
  const [view, setView] = useState<'login' | 'register'>(initialView);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {view === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess} 
            onRegisterClick={() => setView('register')} 
          />
        ) : (
          <RegisterForm 
            onSuccess={handleSuccess} 
            onLoginClick={() => setView('login')} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal; 