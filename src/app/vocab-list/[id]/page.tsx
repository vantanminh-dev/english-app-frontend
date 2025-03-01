'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { dictionaryApi, vocabListApi, DictionaryResponse } from '@/utils/api';
import Link from 'next/link';
import CorrectWordAlert from '@/components/CorrectWordAlert';

export default function VocabListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const store = useStore();
  const listId = params.id as string;
  const list = store.vocabLists.find(l => l._id === listId);
  
  const [searchWord, setSearchWord] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DictionaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!list) {
      loadList();
    }
  }, [listId]);

  const loadList = async () => {
    try {
      store.setLoading(true);
      const lists = await vocabListApi.getLists();
      store.setVocabLists(lists);
    } catch (error) {
      store.setError('Failed to load vocabulary list');
    } finally {
      store.setLoading(false);
    }
  };

  const handleSearch = async (wordOverride?: string) => {
    const wordToSearch = wordOverride || searchWord;
    if (!wordToSearch.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await dictionaryApi.lookup(wordToSearch.trim());
      setSearchResult(result);
    } catch (error) {
      setError('Failed to lookup word');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddWord = async () => {
    if (!searchResult) return;

    try {
      store.setLoading(true);
      await vocabListApi.addWord(listId, {
        wordId: searchResult.word, // Using word as ID since we don't have word IDs
        notes: '',
      });
      loadList(); // Reload the list to get updated words
      setSearchWord('');
      setSearchResult(null);
    } catch (error) {
      store.setError('Failed to add word to list');
    } finally {
      store.setLoading(false);
    }
  };

  const handleRemoveWord = async (wordId: string) => {
    try {
      store.setLoading(true);
      await vocabListApi.removeWord(listId, wordId);
      loadList(); // Reload the list to get updated words
    } catch (error) {
      store.setError('Failed to remove word from list');
    } finally {
      store.setLoading(false);
    }
  };

  if (!list) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            {list.description && (
              <p className="text-gray-600 mt-2">{list.description}</p>
            )}
            <p className="text-gray-600 mt-2">
              {list.statistics.totalWords} words ({list.statistics.learnedWords} learned)
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/vocab-lists"
              className="text-blue-600 hover:text-blue-700"
            >
              Back to Lists
            </Link>
            {list.statistics.totalWords > 0 && (
              <Link
                href={`/flashcards/${listId}`}
                className="bg-green-500 text-white rounded-md py-2 px-4 hover:bg-green-600 transition-colors"
              >
                Study Words
              </Link>
            )}
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              placeholder="Search for a word to add..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="bg-blue-500 text-white rounded-lg px-6 py-3 hover:bg-blue-600 disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {searchResult && (
          <div className="mb-8">
            {!searchResult.isCorrect && searchResult.suggestedWord && (
              <CorrectWordAlert
                word={searchResult.word}
                correction={searchResult.suggestedWord}
                onSearch={() => handleSearch(searchResult.suggestedWord)}
              />
            )}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {searchResult.word}
              </h2>
              {searchResult.phonetic && (
                <p className="text-gray-600 italic mb-2">{searchResult.phonetic}</p>
              )}
              <p className="text-gray-800 mb-4">{searchResult.definition}</p>
              {searchResult.examples && searchResult.examples.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Examples:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {searchResult.examples.map((example, index) => (
                      <li key={index} className="text-gray-600">{example}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={handleAddWord}
                disabled={store.isLoading}
                className="bg-green-500 text-white rounded-md py-2 px-4 hover:bg-green-600 disabled:opacity-50"
              >
                {store.isLoading ? 'Adding...' : 'Add to List'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {list.words?.map((item) => (
            <div
              key={item.word._id}
              className="bg-white rounded-lg shadow p-6 relative"
            >
              <button
                onClick={() => handleRemoveWord(item.word._id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                aria-label="Remove word"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>

              <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.word.word}</h3>
              <p className="text-gray-800 mb-4">{item.word.definition}</p>
              {item.notes && (
                <div className="text-gray-600 italic">{item.notes}</div>
              )}
              {item.learned && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Learned
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {list.words?.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            No words in this list yet. Search for words to add them!
          </div>
        )}
      </div>
    </div>
  );
}
