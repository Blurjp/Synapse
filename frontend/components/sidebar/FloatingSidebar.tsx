'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, FileText, Bookmark, X, Sparkles } from 'lucide-react';
import { ChatPanel } from './ChatPanel';
import { SummarizePanel } from './SummarizePanel';
import { BookmarkPanel } from './BookmarkPanel';

type Tab = 'chat' | 'summarize' | 'bookmark';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'AI Chat', icon: MessageCircle },
  { id: 'summarize', label: 'Summarize', icon: FileText },
  { id: 'bookmark', label: 'Bookmark', icon: Bookmark },
];

export function FloatingSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300',
          isOpen
            ? 'bg-slate-600 text-white hover:bg-slate-700'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-40 h-full w-96 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Synapse Assistant
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-120px)] overflow-hidden">
          {activeTab === 'chat' && <ChatPanel />}
          {activeTab === 'summarize' && <SummarizePanel />}
          {activeTab === 'bookmark' && <BookmarkPanel />}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
