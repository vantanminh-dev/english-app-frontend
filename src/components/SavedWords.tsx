import React, { useState, useEffect } from 'react';
import { getSavedWords, removeSavedWord, SavedWord } from '@/utils/localStorage';

interface SavedWordsProps {
  onWordSelect: (word: string) => void;
}

const SavedWords: React.FC<SavedWordsProps> = ({ onWordSelect }) => {
  const [savedWords, setSavedWords] = useState<SavedWord[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved words when component mounts or when isOpen changes to true
    if (isOpen) {
      setSavedWords(getSavedWords());
    }
  }, [isOpen]);

  const handleRemoveWord = (word: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the word selection
    removeSavedWord(word);
    setSavedWords(getSavedWords());
  };

  const handleWordClick = (word: string) => {
    onWordSelect(word);
    setIsOpen(false); // Close the panel after selecting a word
  };

  if (savedWords.length === 0 && isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-10">
        <div className="bg-white rounded-lg shadow-lg p-4 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Saved Words</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600">You haven't saved any words yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-10">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg"
          title="View saved words"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4 w-80 max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Saved Words</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="space-y-3">
            {savedWords.map((savedWord) => (
              <div 
                key={savedWord.word} 
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => handleWordClick(savedWord.word)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{savedWord.word}</h4>
                    {savedWord.phonetic && <p className="text-sm text-gray-500">{savedWord.phonetic}</p>}
                  </div>
                  <button 
                    onClick={(e) => handleRemoveWord(savedWord.word, e)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove word"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{savedWord.definition}</p>
                {savedWord.translations?.vietnamese && (
                  <p className="text-sm text-gray-500 mt-1">{savedWord.translations.vietnamese}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedWords; 