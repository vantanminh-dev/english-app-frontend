import React, { useState, useEffect } from 'react';
import { saveWord, removeSavedWord, isWordSaved } from '@/utils/localStorage';
import { DictionaryResponse, savedWordsApi } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

interface SaveWordButtonProps {
  wordData: DictionaryResponse;
}

const SaveWordButton: React.FC<SaveWordButtonProps> = ({ wordData }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, triggerSavedWordsUpdate, savedWordsUpdated } = useAuth();

  // Use useEffect to set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Check if the word is already saved when the component mounts or wordData changes
    // or when savedWordsUpdated changes, but only on the client side
    if (isClient) {
      checkIfWordSaved();
    }
  }, [wordData.word, isAuthenticated, savedWordsUpdated, isClient]);

  const checkIfWordSaved = async () => {
    if (!isClient) return;
    
    try {
      if (isAuthenticated) {
        // Check if word is saved in the API using the new savedWordsApi
        const saved = await savedWordsApi.isWordSaved(wordData.word);
        setIsSaved(saved);
      } else {
        // Use localStorage for non-authenticated users
        setIsSaved(isWordSaved(wordData.word));
      }
      setSaveError(false);
    } catch (error) {
      console.error('Error checking if word is saved:', error);
      setIsSaved(false);
      setSaveError(true);
    }
  };

  const handleToggleSave = async () => {
    if (isLoading || !isClient) return;
    
    setIsLoading(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    try {
      if (isAuthenticated) {
        if (isSaved) {
          // Get the saved words to find the ID of the word to remove
          const savedWords = await savedWordsApi.getSavedWords();
          const savedWord = savedWords.find(sw => 
            sw.wordText.toLowerCase() === wordData.word.toLowerCase()
          );
          
          if (savedWord) {
            // Remove word using the new savedWordsApi
            await savedWordsApi.removeSavedWord(savedWord._id);
          } else {
            throw new Error('Word not found in saved words');
          }
        } else {
          // Add word using the new savedWordsApi
          await savedWordsApi.saveWord({
            word: wordData.word,
            notes: '' // Optional notes can be added here
          });
          // Show success indicator
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        }
        // Trigger update for other components
        triggerSavedWordsUpdate();
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
      setSaveError(true);
      // Try again after a delay
      setTimeout(() => {
        checkIfWordSaved();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything on the server
  if (!isClient) {
    return null;
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isLoading 
          ? 'bg-gray-100 text-gray-500'
          : saveError
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : saveSuccess
              ? 'bg-green-100 text-green-700 animate-pulse'
              : isSaved
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
      title={saveError ? 'Error saving word. Click to retry.' : isSaved ? 'Remove from saved words' : 'Save this word'}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : saveError ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ) : saveSuccess ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      )}
      {isLoading ? 'Saving...' : saveError ? 'Retry' : saveSuccess ? 'Saved!' : isSaved ? 'Saved' : 'Save Word'}
    </button>
  );
};

export default SaveWordButton; 