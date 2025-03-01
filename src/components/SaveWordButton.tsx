import React, { useState, useEffect } from 'react';
import { saveWord, removeSavedWord, isWordSaved } from '@/utils/localStorage';
import { DictionaryResponse } from '@/utils/api';

interface SaveWordButtonProps {
  wordData: DictionaryResponse;
}

const SaveWordButton: React.FC<SaveWordButtonProps> = ({ wordData }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if the word is already saved when the component mounts or wordData changes
    setIsSaved(isWordSaved(wordData.word));
  }, [wordData.word]);

  const handleToggleSave = () => {
    if (isSaved) {
      removeSavedWord(wordData.word);
      setIsSaved(false);
    } else {
      saveWord(wordData);
      setIsSaved(true);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isSaved
          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
      title={isSaved ? 'Remove from saved words' : 'Save this word'}
    >
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
      {isSaved ? 'Saved' : 'Save Word'}
    </button>
  );
};

export default SaveWordButton; 