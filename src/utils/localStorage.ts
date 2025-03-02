import { DictionaryResponse } from './api';

const SAVED_WORDS_KEY = 'saved_words';

export interface SavedWord {
  _id: string;
  word: string;
  definition: string;
  phonetic: string;
  partOfSpeech?: string;
  translations?: {
    vietnamese?: string;
  };
  savedAt: string;
}

// Helper function to check if code is running on the client
const isClient = typeof window !== 'undefined';

// Generate a simple unique ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

export const saveWord = (wordData: DictionaryResponse): void => {
  if (!isClient) return;
  
  const savedWords = getSavedWords();
  
  // Check if word already exists
  const existingIndex = savedWords.findIndex(item => item.word.toLowerCase() === wordData.word.toLowerCase());
  
  const wordToSave: SavedWord = {
    _id: existingIndex >= 0 ? savedWords[existingIndex]._id : generateId(),
    word: wordData.word,
    definition: wordData.definition,
    phonetic: wordData.phonetic || '',
    partOfSpeech: wordData.partOfSpeech,
    translations: wordData.translations,
    savedAt: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    // Update existing word
    savedWords[existingIndex] = wordToSave;
  } else {
    // Add new word
    savedWords.push(wordToSave);
  }
  
  localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(savedWords));
};

export const getSavedWords = (): SavedWord[] => {
  if (!isClient) return [];
  
  const savedWordsJson = localStorage.getItem(SAVED_WORDS_KEY);
  if (!savedWordsJson) return [];
  
  try {
    const words = JSON.parse(savedWordsJson);
    // Ensure all words have _id
    return words.map((word: any) => ({
      _id: word._id || generateId(),
      word: word.word,
      definition: word.definition,
      phonetic: word.phonetic || '',
      partOfSpeech: word.partOfSpeech,
      translations: word.translations,
      savedAt: word.savedAt
    }));
  } catch (error) {
    console.error('Error parsing saved words:', error);
    return [];
  }
};

export const removeSavedWord = (word: string): void => {
  if (!isClient) return;
  
  const savedWords = getSavedWords();
  const updatedWords = savedWords.filter(item => item.word.toLowerCase() !== word.toLowerCase());
  localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(updatedWords));
};

export const isWordSaved = (word: string): boolean => {
  if (!isClient) return false;
  
  const savedWords = getSavedWords();
  return savedWords.some(item => item.word.toLowerCase() === word.toLowerCase());
};
