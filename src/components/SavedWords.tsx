import React, { useState, useEffect } from 'react';
import { getSavedWords, removeSavedWord } from '@/utils/localStorage';
import { useAuth } from '@/context/AuthContext';
import { savedWordsApi } from '@/utils/api';

interface SavedWord {
  _id: string;
  word: string;
  definition: string;
  phonetic: string;
  savedAt: string;
  notes?: string;
}

interface SavedWordsProps {
  onWordSelect: (word: string) => void;
}

interface WordDetails {
  _id: string;
  word: string;
  definition: string;
  phonetic: string;
  partOfSpeech?: string;
  examples?: string[];
  translations?: Record<string, string>;
  synonyms?: string[];
  antonyms?: string[];
}

interface ApiSavedWord {
  _id: string;
  word: WordDetails;
  wordText: string;
  user: string;
  notes?: string;
  savedAt: string;
  updatedAt?: string;
}

type ApiResponse = {
  savedWords: ApiSavedWord[];
  pagination: {
    total: number;
    pages: number;
    currentPage: number;
    limit: number;
  };
};

// Type guard function for API response
const isApiResponse = (response: any): response is ApiResponse => {
  return typeof response === 'object' && 
         response !== null &&
         'savedWords' in response &&
         Array.isArray(response.savedWords) &&
         'pagination' in response;
};

// Type guard functions to check the type of saved word
const isApiSavedWord = (word: any): word is ApiSavedWord => {
  return word && 'wordText' in word && 'word' in word && typeof word.word === 'object';
};

const isLocalSavedWord = (word: any): word is SavedWord => {
  return word && '_id' in word && 'word' in word && typeof word.word === 'string' && 'definition' in word;
};

const SavedWords: React.FC<SavedWordsProps> = ({ onWordSelect }) => {
  const [savedWords, setSavedWords] = useState<Array<SavedWord | ApiSavedWord>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, savedWordsUpdated, triggerSavedWordsUpdate } = useAuth();

  // Don't render anything on the server
  if (typeof window === 'undefined') {
    return null;
  }

  // Initialize client state immediately
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Load saved words when component mounts or when isOpen changes to true
    // or when savedWordsUpdated changes
    if (isOpen && isClient) {
      loadSavedWords();
    }
  }, [isOpen, isAuthenticated, savedWordsUpdated, isClient]);

  const loadSavedWords = async () => {
    if (!isClient) return;
    
    setIsLoading(true);
    setLoadError(false);
    
    try {
      if (isAuthenticated) {
        try {
          // Get saved words from API
          const response = await savedWordsApi.getSavedWords();
          
          if (!isApiResponse(response)) {
            console.error('Invalid API response format:', response);
            throw new Error('Invalid API response format');
          }
          
          // Transform API response to SavedWord format
          const transformedWords = response.savedWords.map((word: ApiSavedWord) => ({
            _id: word._id,
            word: word.wordText,
            definition: word.word.definition,
            phonetic: word.word.phonetic,
            savedAt: word.savedAt,
            notes: word.notes || ''
          }));
          setSavedWords(transformedWords);
        } catch (error) {
          console.error('API Error:', error);
          // Fallback to localStorage if API fails
          const localSavedWords = getSavedWords();
          setSavedWords(localSavedWords);
          setLoadError(true);
        }
      } else {
        // Use localStorage for non-authenticated users
        const localSavedWords = getSavedWords();
        setSavedWords(localSavedWords);
      }
    } catch (error) {
      console.error('Error loading saved words:', error);
      setLoadError(true);
      // Fall back to localStorage if API fails
      if (isAuthenticated) {
        const localSavedWords = getSavedWords();
        setSavedWords(localSavedWords);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveWord = async (word: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the word selection
    
    try {
      if (isAuthenticated) {
        // Find the saved word by its text to get the ID
        const savedWordItem = savedWords.find(sw => {
          const wordText = isApiSavedWord(sw) ? sw.wordText : sw.word;
          return wordText.toLowerCase() === word.toLowerCase();
        });
        
        if (!savedWordItem) {
          throw new Error('Word not found in saved words');
        }

        // Remove word using the new savedWordsApi
        await savedWordsApi.removeSavedWord(savedWordItem._id);
        // Trigger update for other components
        triggerSavedWordsUpdate();
      } else {
        // Use localStorage for non-authenticated users
        removeSavedWord(word);
      }
      
      // Update the list
      loadSavedWords();
    } catch (error) {
      console.error('Error removing word:', error);
      // Remove from localStorage as fallback
      removeSavedWord(word);
      loadSavedWords();
    }
  };

  const handleWordClick = (word: string) => {
    onWordSelect(word);
    setIsOpen(false);
  };

  // Format date in a consistent way that doesn't depend on locale
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Don't render anything on the server
  if (!isClient) {
    return <div className="fixed bottom-4 right-4 z-10"></div>;
  }

  // Render the saved words list
  return (
    <div className="fixed bottom-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none"
        title="Saved Words"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
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
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
            <h3 className="text-lg font-medium">Saved Words</h3>
            {loadError && isAuthenticated && (
              <button 
                onClick={loadSavedWords}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                title="Error loading from cloud. Using local data. Click to retry."
              >
                Retry
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-4 text-center">
              <svg className="animate-spin h-6 w-6 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-gray-600">Loading saved words...</p>
            </div>
          ) : savedWords.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No saved words yet</p>
            </div>
          ) : (
            <ul className="divide-y">
              {savedWords.map((wordItem: SavedWord | ApiSavedWord, index: number) => {
                // Get word text based on the type
                let wordText = '';
                let definition = '';
                let savedDate = new Date().toISOString();

                if (isApiSavedWord(wordItem)) {
                  wordText = wordItem.wordText;
                  definition = wordItem.word.definition;
                  savedDate = wordItem.savedAt;
                } else if (isLocalSavedWord(wordItem)) {
                  wordText = wordItem.word;
                  definition = wordItem.definition;
                  savedDate = wordItem.savedAt;
                }
                
                return (
                  <li
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleWordClick(wordText)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{wordText}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{definition}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Saved: {formatDate(savedDate)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleRemoveWord(wordText, e)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove from saved words"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedWords;
