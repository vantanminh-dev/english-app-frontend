import { DictionaryResponse } from './api';

const SAVED_WORDS_KEY = 'saved_words';

export interface SavedWord {
  word: string;
  definition: string;
  phonetic?: string;
  partOfSpeech?: string;
  translations?: {
    vietnamese?: string;
  };
  savedAt: string;
}

export const saveWord = (wordData: DictionaryResponse): void => {
  const savedWords = getSavedWords();
  
  // Check if word already exists
  const existingIndex = savedWords.findIndex(item => item.word.toLowerCase() === wordData.word.toLowerCase());
  
  const wordToSave: SavedWord = {
    word: wordData.word,
    definition: wordData.definition,
    phonetic: wordData.phonetic,
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
  const savedWordsJson = localStorage.getItem(SAVED_WORDS_KEY);
  if (!savedWordsJson) return [];
  
  try {
    return JSON.parse(savedWordsJson);
  } catch (error) {
    console.error('Error parsing saved words:', error);
    return [];
  }
};

export const removeSavedWord = (word: string): void => {
  const savedWords = getSavedWords();
  const updatedWords = savedWords.filter(item => item.word.toLowerCase() !== word.toLowerCase());
  localStorage.setItem(SAVED_WORDS_KEY, JSON.stringify(updatedWords));
};

export const isWordSaved = (word: string): boolean => {
  const savedWords = getSavedWords();
  return savedWords.some(item => item.word.toLowerCase() === word.toLowerCase());
}; 