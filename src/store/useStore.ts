import { create } from 'zustand';
import { DictionaryResponse, VocabList } from '@/utils/api';

interface Store {
  vocabLists: VocabList[];
  isLoading: boolean;
  error: string | null;
  
  // Vocab list actions
  setVocabLists: (lists: VocabList[]) => void;
  addVocabList: (list: VocabList) => void;
  updateVocabList: (listId: string, updatedList: Partial<VocabList>) => void;
  deleteVocabList: (listId: string) => void;
  
  // Status actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  vocabLists: [],
  isLoading: false,
  error: null,

  setVocabLists: (lists) => set({ vocabLists: lists }),
  addVocabList: (list) => set((state) => ({ 
    vocabLists: [...state.vocabLists, list] 
  })),
  updateVocabList: (listId, updatedList) => set((state) => ({
    vocabLists: state.vocabLists.map((list) =>
      list._id === listId ? { ...list, ...updatedList } : list
    ),
  })),
  deleteVocabList: (listId) => set((state) => ({
    vocabLists: state.vocabLists.filter((list) => list._id !== listId),
  })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
