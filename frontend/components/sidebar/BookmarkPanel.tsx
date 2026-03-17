'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, Trash2, ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  createdAt: Date;
}

// Sample bookmarks for demo
const sampleBookmarks: BookmarkItem[] = [
  {
    id: '1',
    title: 'Next.js Documentation',
    url: 'https://nextjs.org/docs',
    description: 'The official Next.js documentation',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: 'A utility-first CSS framework',
    createdAt: new Date(),
  },
];

export function BookmarkPanel() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(sampleBookmarks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmark, setNewBookmark] = useState({ title: '', url: '', description: '' });

  const handleAddBookmark = () => {
    if (!newBookmark.title.trim() || !newBookmark.url.trim()) return;

    const bookmark: BookmarkItem = {
      id: Date.now().toString(),
      title: newBookmark.title.trim(),
      url: newBookmark.url.trim(),
      description: newBookmark.description.trim() || undefined,
      createdAt: new Date(),
    };

    setBookmarks((prev) => [bookmark, ...prev]);
    setNewBookmark({ title: '', url: '', description: '' });
    setShowAddForm(false);
  };

  const handleDeleteBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Your Bookmarks
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={cn(
            'flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
            showAddForm
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          )}
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2">
          <input
            type="text"
            value={newBookmark.title}
            onChange={(e) => setNewBookmark((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Title"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="url"
            value={newBookmark.url}
            onChange={(e) => setNewBookmark((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="URL"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={newBookmark.description}
            onChange={(e) => setNewBookmark((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description (optional)"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAddBookmark}
            disabled={!newBookmark.title.trim() || !newBookmark.url.trim()}
            className="w-full rounded-lg bg-primary-500 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Bookmark
          </button>
        </div>
      )}

      {/* Bookmark List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm font-medium text-slate-900 dark:text-white hover:text-primary-500"
                >
                  <span className="truncate">{bookmark.title}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                {bookmark.description && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {bookmarks.length === 0 && !showAddForm && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-3 rounded-full bg-slate-100 dark:bg-slate-800 p-4">
            <Bookmark className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No bookmarks yet. Click Add to save your first bookmark.
          </p>
        </div>
      )}
    </div>
  );
}
