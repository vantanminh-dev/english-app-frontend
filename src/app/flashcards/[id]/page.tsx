'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { vocabListApi, VocabList } from '@/utils/api';
import Link from 'next/link';

interface FlashcardWord {
  word: {
    _id: string;
    word: string;
    definition: string;
  };
  learned: boolean;
  notes?: string;
  lastReviewed: string;
  proficiency: number;
}

export default function FlashcardsPage() {
  const params = useParams();
  const store = useStore();
  const listId = params.id as string;
  const list = store.vocabLists.find((l: VocabList) => l._id === listId);
  
  const [cards, setCards] = useState<FlashcardWord[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studyProgress, setStudyProgress] = useState({
    remembered: 0,
    total: 0,
  });

  useEffect(() => {
    loadList();
  }, [listId]);

  const loadList = async () => {
    try {
      store.setLoading(true);
      const lists = await vocabListApi.getLists();
      const currentList = lists.find((l) => l._id === listId);
      if (currentList?.words) {
        const shuffledCards = [...currentList.words].sort(() => Math.random() - 0.5);
        setCards(shuffledCards);
        setStudyProgress({ remembered: 0, total: shuffledCards.length });
        store.setVocabLists(lists);
      }
    } catch (error) {
      setError('Failed to load flashcards');
    } finally {
      store.setLoading(false);
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (remembered: boolean) => {
    if (remembered) {
      setStudyProgress(prev => ({
        ...prev,
        remembered: prev.remembered + 1,
      }));
    }

    setIsFlipped(false);
    setCurrentCardIndex(prev => prev + 1);
  };

  const handleRestart = () => {
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyProgress({ remembered: 0, total: shuffledCards.length });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!list || !cards.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No words to study
          </h1>
          <p className="text-gray-600 mb-8">
            Add some words to your vocabulary list first!
          </p>
          <Link
            href={`/vocab-list/${listId}`}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  if (currentCardIndex >= cards.length) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Study Session Complete!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You remembered {studyProgress.remembered} out of {studyProgress.total} words
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRestart}
              className="bg-blue-500 text-white rounded-md py-2 px-6 hover:bg-blue-600"
            >
              Study Again
            </button>
            <Link
              href={`/vocab-list/${listId}`}
              className="text-blue-600 hover:text-blue-700"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/vocab-list/${listId}`}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to List
          </Link>
          <div className="text-gray-600">
            Card {currentCardIndex + 1} of {cards.length}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div 
          className="bg-white rounded-xl shadow-lg p-8 mb-8 cursor-pointer min-h-[300px] flex items-center justify-center transition-transform duration-200 hover:shadow-xl"
          onClick={handleFlip}
        >
          <div className="text-center">
            {isFlipped ? (
              <p className="text-2xl mb-4">{currentCard.word.definition}</p>
            ) : (
              <h2 className="text-4xl font-bold">{currentCard.word.word}</h2>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleNext(false)}
            className="bg-red-500 text-white rounded-md py-3 px-8 hover:bg-red-600"
          >
            Didn't Know
          </button>
          <button
            onClick={() => handleNext(true)}
            className="bg-green-500 text-white rounded-md py-3 px-8 hover:bg-green-600"
          >
            Knew It!
          </button>
        </div>
      </div>
    </div>
  );
}
