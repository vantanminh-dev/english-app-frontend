'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { savedWordsApi } from '@/utils/api';

const CloudSaveIndicator: React.FC = () => {
  const [savedWordsCount, setSavedWordsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, savedWordsUpdated } = useAuth();

  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isClient) {
      loadSavedWordsCount();
    }
  }, [isAuthenticated, savedWordsUpdated, isClient]);

  const loadSavedWordsCount = async () => {
    if (!isAuthenticated || !isClient) return;
    
    setIsLoading(true);
    setHasError(false);
    try {
      const savedWords = await savedWordsApi.getSavedWords();
      setSavedWordsCount(savedWords.length);
    } catch (error) {
      console.error('Error loading saved words count:', error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything on the server or if not authenticated
  if (!isClient || !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`bg-white rounded-full shadow-lg p-2.5 flex items-center justify-center hover:bg-blue-50 transition-colors duration-200 border ${hasError ? 'border-red-200' : 'border-blue-100'}`}>
        {isLoading ? (
          <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : hasError ? (
          <div 
            className="flex items-center cursor-pointer" 
            onClick={loadSavedWordsCount}
            title="Error loading saved words. Click to retry."
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-red-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
          </div>
        ) : (
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" 
              />
            </svg>
            <span className="ml-1.5 text-sm font-medium text-blue-700">{savedWordsCount}</span>
          </div>
        )}
      </div>
      <div className="absolute -bottom-6 right-0 text-xs text-gray-500 whitespace-nowrap">
        {hasError ? "Auth Error" : "Saved Words"}
      </div>
    </div>
  );
};

export default CloudSaveIndicator; 