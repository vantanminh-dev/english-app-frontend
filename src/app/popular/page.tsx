'use client';

import { useEffect, useState } from 'react';
import { dictionaryApi } from '@/utils/api';

interface PopularWord {
  word: string;
  definition: string;
  usage: {
    frequency: number;
    lastAccessed: string;
  };
}

export default function PopularWordsPage() {
  const [words, setWords] = useState<PopularWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPopularWords();
  }, []);

  const loadPopularWords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dictionaryApi.getPopularWords(20); // Get top 20 words
      setWords(data);
    } catch (err) {
      setError('Failed to load popular words');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center text-gray-600">
          Loading popular words...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Popular Words
        </h1>

        <div className="space-y-4">
          {words.map((word, index) => (
            <div
              key={word.word}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {word.word}
                  </h2>
                  <p className="text-gray-800">{word.definition}</p>
                </div>
                <div className="text-right">
                  <div className="text-gray-600 text-sm">
                    Searched {word.usage.frequency} times
                  </div>
                  <div className="text-gray-500 text-xs">
                    Last searched: {new Date(word.usage.lastAccessed).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {words.length === 0 && (
          <div className="text-center text-gray-600">
            No popular words yet. Start searching to see them appear here!
          </div>
        )}
      </div>
    </div>
  );
}
