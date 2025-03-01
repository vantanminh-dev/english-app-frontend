import React, { useState, useEffect } from 'react';
import { saveWord, removeSavedWord, isWordSaved } from '@/utils/localStorage';
import { DictionaryResponse } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

interface SaveWordButtonProps {
  wordData: DictionaryResponse;
}

const SaveWordButton: React.FC<SaveWordButtonProps> = ({ wordData }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Check if the word is already saved when the component mounts or wordData changes
    if (isAuthenticated) {
      checkIfWordSavedInAPI();
    } else {
      setIsSaved(isWordSaved(wordData.word));
    }
  }, [wordData.word, isAuthenticated]);

  const checkIfWordSavedInAPI = async () => {
    try {
      // This is a placeholder - you would need to implement an API endpoint to check if a word is saved
      // For now, we'll just use localStorage as a fallback
      setIsSaved(isWordSaved(wordData.word));
    } catch (error) {
      console.error('Error checking if word is saved:', error);
      setIsSaved(false);
    }
  };

  const handleToggleSave = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isAuthenticated) {
        if (isSaved) {
          // Remove word from user's vocabulary list via API
          // This is a placeholder - you would need to implement the actual API call
          // For now, we'll just use localStorage
          removeSavedWord(wordData.word);
        } else {
          // Add word to user's vocabulary list via API
          // This is a placeholder - you would need to implement the actual API call
          // For now, we'll just use localStorage
          saveWord(wordData);
        }
      } else {
        // Use localStorage for non-authenticated users
        if (isSaved) {
          removeSavedWord(wordData.word);
        } else {
          saveWord(wordData);
        }
      }
      
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error saving word:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isLoading 
          ? 'bg-gray-100 text-gray-500'
          : isSaved
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
      title={isSaved ? 'Remove from saved words' : 'Save this word'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${isLoading ? 'animate-pulse' : ''}`}
        fill={isSaved ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {isLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save Word'}
    </button>
  );
};

export default SaveWordButton; 