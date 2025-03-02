import axios from 'axios';

// Import TOKEN_KEY from auth.ts for consistency
import authService from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = 'auth_token'; // This should match the one in auth.ts

// Helper function to check if code is running on the client
const isClient = typeof window !== 'undefined';

// Create API instance with auth header interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    // Only access localStorage on the client side
    if (isClient) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface DictionaryResponse {
  word: string;
  correction?: string;
  isCorrect: boolean;
  suggestedWord: string;
  definition: string;
  phonetic: string;
  partOfSpeech: string;
  examples: string[];
  translations: {
    vietnamese: string;
  };
  synonyms: string[];
  antonyms: string[];
  source: 'gemini' | 'database';
  usage: {
    frequency: number;
    lastAccessed: string;
  };
  folderId?: string;
}

export interface VocabList {
  _id: string;
  name: string;
  description?: string;
  statistics: {
    totalWords: number;
    learnedWords: number;
    lastStudied: string;
  };
  words?: Array<{
    word: {
      _id: string;
      word: string;
      definition: string;
    };
    learned: boolean;
    notes?: string;
    lastReviewed: string;
    proficiency: number;
  }>;
}

export const dictionaryApi = {
  lookup: async (word: string): Promise<DictionaryResponse> => {
    const response = await api.post('/dictionary/lookup', { word });
    return response.data;
  },

  checkWord: async (word: string): Promise<{ exists: boolean }> => {
    const response = await api.get(`/dictionary/check/${word}`);
    return response.data;
  },

  getPopularWords: async (limit?: number): Promise<Array<{
    word: string;
    definition: string;
    usage: {
      frequency: number;
      lastAccessed: string;
    };
  }>> => {
    const response = await api.get('/dictionary/popular', {
      params: { limit },
    });
    return response.data;
  },
};

export const vocabListApi = {
  getLists: async (): Promise<VocabList[]> => {
    const response = await api.get('/vocab-lists');
    return response.data;
  },

  createList: async (data: {
    name: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<VocabList> => {
    const response = await api.post('/vocab-lists', data);
    return response.data;
  },

  updateList: async (listId: string, data: {
    name?: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
  }): Promise<VocabList> => {
    const response = await api.put(`/vocab-lists/${listId}`, data);
    return response.data;
  },

  deleteList: async (listId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/vocab-lists/${listId}`);
    return response.data;
  },

  addWord: async (listId: string, data: {
    word?: string;
    wordId?: string;
    notes?: string;
  }): Promise<{
    list: { _id: string; name: string };
    wordEntry: {
      word: { _id: string; word: string; definition: string };
      status: string;
      notes?: string;
      addedAt: string;
    };
  }> => {
    const response = await api.post(`/vocab-lists/${listId}/add-word`, data);
    return response.data;
  },

  removeWord: async (listId: string, wordId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/vocab-lists/${listId}/remove-word`, {
      data: { wordId },
    });
    return response.data;
  },

  updateWordStatus: async (listId: string, data: {
    wordId: string;
    status: string;
    notes?: string;
  }): Promise<{
    word: { _id: string; word: string };
    status: string;
    notes?: string;
    updatedAt: string;
  }> => {
    const response = await api.put(`/vocab-lists/${listId}/word-status`, data);
    return response.data;
  },

  getDefaultList: async (): Promise<VocabList> => {
    // First try to get a list named "My Saved Words"
    try {
      const lists = await vocabListApi.getLists();
      const defaultList = lists.find(list => list.name === "My Saved Words");
      
      if (defaultList) {
        return defaultList;
      }
      
      // If no default list exists, create one
      return await vocabListApi.createList({
        name: "My Saved Words",
        description: "Default list for saved words",
        isPublic: false
      });
    } catch (error) {
      console.error("Error getting default list:", error);
      throw error;
    }
  },
  
  saveWord: async (word: string, definition: string): Promise<{
    list: { _id: string; name: string };
    wordEntry: {
      word: { _id: string; word: string; definition: string };
      status: string;
      notes?: string;
      addedAt: string;
    };
  }> => {
    try {
      // Get or create default list
      const defaultList = await vocabListApi.getDefaultList();
      
      // Add word to the list
      return await vocabListApi.addWord(defaultList._id, { word });
    } catch (error) {
      console.error("Error saving word:", error);
      throw error;
    }
  },
  
  isWordSaved: async (word: string): Promise<boolean> => {
    try {
      // Get default list
      const defaultList = await vocabListApi.getDefaultList();
      
      // Check if word exists in the list
      if (defaultList.words) {
        return defaultList.words.some(entry => 
          entry.word.word.toLowerCase() === word.toLowerCase()
        );
      }
      
      return false;
    } catch (error) {
      console.error("Error checking if word is saved:", error);
      return false;
    }
  },
  
  removeSavedWord: async (word: string): Promise<{ message: string }> => {
    try {
      // Get default list
      const defaultList = await vocabListApi.getDefaultList();
      
      // Find the word entry
      if (defaultList.words) {
        const wordEntry = defaultList.words.find(entry => 
          entry.word.word.toLowerCase() === word.toLowerCase()
        );
        
        if (wordEntry) {
          // Remove the word
          return await vocabListApi.removeWord(defaultList._id, wordEntry.word._id);
        }
      }
      
      throw new Error("Word not found in saved list");
    } catch (error) {
      console.error("Error removing saved word:", error);
      throw error;
    }
  },
  
  getSavedWords: async (): Promise<Array<{
    _id: string;
    word: string;
    definition: string;
    notes?: string;
    status: string;
    addedAt: string;
  }>> => {
    try {
      // Get default list
      const defaultList = await vocabListApi.getDefaultList();
      
      // Return words in the list
      if (defaultList.words) {
        return defaultList.words.map(entry => ({
          _id: entry.word._id,
          word: entry.word.word,
          definition: entry.word.definition,
          notes: entry.notes,
          status: entry.learned ? 'learned' : 'new',
          addedAt: entry.lastReviewed
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error getting saved words:", error);
      return [];
    }
  }
};

export const textToSpeechApi = {
  speak: async (text: string): Promise<string> => {
    // Encode the text for URL
    const encodedText = encodeURIComponent(text);
    // Return the URL for the audio
    return `https://proxy.junookyo.workers.dev/?language=en-US&text=${encodedText}`;
  }
};

/**
 * API for managing saved words
 * 
 * This API provides methods for saving, retrieving, and managing saved words.
 * It follows the new API structure as described in the documentation:
 * 
 * - POST /saved-words: Save a word
 * - GET /saved-words: Get all saved words
 * - DELETE /saved-words/:id: Remove a saved word
 * - PATCH /saved-words/:id: Update notes for a saved word
 * 
 * Authentication is required for all endpoints.
 */
export const savedWordsApi = {
  // Save a word to user's saved words
  saveWord: async (data: {
    word: string;
    notes?: string;
  }): Promise<{
    _id: string;
    word: {
      _id: string;
      word: string;
      definition: string;
      phonetic: string;
    };
    wordText: string;
    user: string;
    notes?: string;
    savedAt: string;
  }> => {
    const response = await api.post('/saved-words', data);
    return response.data;
  },

  // Get all saved words for the current user
  getSavedWords: async (): Promise<Array<{
    _id: string;
    word: {
      _id: string;
      word: string;
      definition: string;
      phonetic: string;
    };
    wordText: string;
    user: string;
    notes?: string;
    savedAt: string;
  }>> => {
    const response = await api.get('/saved-words');
    return response.data;
  },

  // Remove a saved word
  removeSavedWord: async (wordId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/saved-words/${wordId}`);
    return response.data;
  },

  // Update notes for a saved word
  updateNotes: async (wordId: string, notes: string): Promise<{
    _id: string;
    notes: string;
    updatedAt: string;
  }> => {
    const response = await api.patch(`/saved-words/${wordId}`, { notes });
    return response.data;
  },

  // Check if a word is saved
  isWordSaved: async (word: string): Promise<boolean> => {
    try {
      const savedWords = await savedWordsApi.getSavedWords();
      return savedWords.some(savedWord => 
        savedWord.wordText.toLowerCase() === word.toLowerCase()
      );
    } catch (error) {
      console.error("Error checking if word is saved:", error);
      return false;
    }
  }
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // Extract error details from the response
    const errorMessage = error.response?.data?.error || 'An error occurred';
    const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';
    const statusCode = error.response?.status;

    // Add specific handling for authentication errors
    if (statusCode === 401) {
      console.error('Authentication error: Token may be invalid or expired');
      // You might want to trigger a logout or token refresh here
      // For now, we'll just log the error and let the components handle it
    }

    // Add specific handling for authorization errors
    if (statusCode === 403) {
      console.error('Authorization error: Not authorized to perform this action');
    }

    // Add specific handling for not found errors
    if (statusCode === 404) {
      console.error('Not found error: The requested resource was not found');
    }

    // Add specific handling for bad request errors
    if (statusCode === 400) {
      console.error('Bad request error:', errorMessage);
    }

    // Return a standardized error object
    return Promise.reject({ 
      message: errorMessage, 
      code: errorCode,
      statusCode,
      isAuthError: statusCode === 401,
      isPermissionError: statusCode === 403,
      isNotFoundError: statusCode === 404,
      isBadRequestError: statusCode === 400
    });
  }
);

export default api;
