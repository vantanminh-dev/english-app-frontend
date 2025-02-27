'use client';

import { useState } from 'react';
import { dictionaryApi, DictionaryResponse } from '@/utils/api';

export default function Home() {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dictionaryApi.lookup(word.trim());
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          English Dictionary
        </h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter a word to look up..."
              className="flex-1 p-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-lg font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-8">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-3xl font-bold mb-2">{result.word}</h2>
              {result.phonetic && (
                <p className="text-gray-600 text-lg">{result.phonetic}</p>
              )}
              {result.partOfSpeech && (
                <p className="text-gray-600 italic">{result.partOfSpeech}</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Definition:</h3>
              <p className="text-lg text-gray-800">{result.definition}</p>
            </div>

            {result.translations?.vietnamese && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Vietnamese Translation:</h3>
                <p className="text-lg text-gray-800">{result.translations.vietnamese}</p>
              </div>
            )}

            {result.examples && result.examples.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Examples:</h3>
                <ul className="list-disc list-inside space-y-2">
                  {result.examples.map((example, index) => (
                    <li key={index} className="text-lg text-gray-700">{example}</li>
                  ))}
                </ul>
              </div>
            )}

            {(result.synonyms && result.synonyms.length > 0) && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Synonyms:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.synonyms.map((synonym, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {synonym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(result.antonyms && result.antonyms.length > 0) && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Antonyms:</h3>
                <div className="flex flex-wrap gap-2">
                  {result.antonyms.map((antonym, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {antonym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t text-sm text-gray-500">
              Source: {result.source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
