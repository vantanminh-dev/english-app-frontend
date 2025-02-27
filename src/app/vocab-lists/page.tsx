'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { vocabListApi, VocabList } from '@/utils/api';
import Link from 'next/link';

export default function VocabListsPage() {
  const store = useStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  useEffect(() => {
    loadVocabLists();
  }, []);

  const loadVocabLists = async () => {
    try {
      store.setLoading(true);
      const lists = await vocabListApi.getLists();
      store.setVocabLists(lists);
    } catch (error) {
      store.setError('Failed to load vocabulary lists');
    } finally {
      store.setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    try {
      store.setLoading(true);
      const newList = await vocabListApi.createList({
        name: newListName.trim(),
        description: newListDesc.trim() || undefined,
      });
      store.addVocabList(newList);
      setNewListName('');
      setNewListDesc('');
      setIsCreating(false);
    } catch (error) {
      store.setError('Failed to create list');
    } finally {
      store.setLoading(false);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) return;

    try {
      store.setLoading(true);
      store.deleteVocabList(listId);
    } catch (error) {
      store.setError('Failed to delete list');
    } finally {
      store.setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vocabulary Lists</h1>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 transition-colors"
            >
              Create New List
            </button>
          )}
        </div>

        {isCreating && (
          <form onSubmit={handleCreateList} className="mb-8 bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  List Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name..."
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Enter list description..."
                  className="mt-1 w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={store.isLoading}
                  className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600 disabled:opacity-50"
                >
                  {store.isLoading ? 'Creating...' : 'Create List'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-gray-300 text-gray-700 rounded-md py-2 px-4 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {store.error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-8">
            {store.error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {store.vocabLists.map((list) => (
            <div
              key={list._id}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-gray-600 mt-1">{list.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteList(list._id)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Delete list"
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
              </div>

              <div className="flex-1">
                <div className="text-gray-600 mb-4">
                  {list.statistics.totalWords} words
                  {list.statistics.learnedWords > 0 && (
                    <span className="text-green-600">
                      {' '}
                      ({list.statistics.learnedWords} learned)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Link
                  href={`/vocab-list/${list._id}`}
                  className="flex-1 bg-blue-500 text-white rounded-md py-2 px-4 text-center hover:bg-blue-600 transition-colors"
                >
                  View Words
                </Link>
                {list.statistics.totalWords > 0 && (
                  <Link
                    href={`/flashcards/${list._id}`}
                    className="flex-1 bg-green-500 text-white rounded-md py-2 px-4 text-center hover:bg-green-600 transition-colors"
                  >
                    Study
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {!store.isLoading && store.vocabLists.length === 0 && (
          <div className="text-center text-gray-600 mt-8">
            No vocabulary lists yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}
