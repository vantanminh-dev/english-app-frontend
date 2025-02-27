import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DictionaryResponse {
  word: string;
  definition: string;
  phonetic?: string;
  partOfSpeech?: string;
  examples?: string[];
  translations?: {
    vietnamese: string;
  };
  synonyms?: string[];
  antonyms?: string[];
  source: 'gemini' | 'database';
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

  addWord: async (listId: string, data: {
    wordId: string;
    notes?: string;
  }): Promise<VocabList> => {
    const response = await api.post(`/vocab-lists/${listId}/add-word`, data);
    return response.data;
  },

  removeWord: async (listId: string, wordId: string): Promise<VocabList> => {
    const response = await api.delete(`/vocab-lists/${listId}/remove-word`, {
      data: { wordId },
    });
    return response.data;
  },
};

// Error handling interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || 'An error occurred';
    const errorCode = error.response?.data?.code || 'UNKNOWN_ERROR';
    return Promise.reject({ message: errorMessage, code: errorCode });
  }
);

export default api;
