'use client';

import { useState } from 'react';
import { FileText, Loader2, Copy, Check, Sparkles, AlertCircle, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SummarizeResult {
  summary: string;
  key_points: string[];
  word_count: number;
  source_title: string | null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://synapse-production-68d7.up.railway.app';

export function SummarizePanel() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<'concise' | 'detailed' | 'bullet_points'>('concise');

  const handleSummarize = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          title: title.trim() || undefined,
          max_length: 500,
          style: style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const data: SummarizeResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to summarize content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyKeyPoints = async () => {
    if (!result) return;
    const text = result.key_points.map((p, i) => `${i + 1}. ${p}`).join('\n');
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Input Section */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <FileText className="h-4 w-4" />
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title..."
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Content to summarize
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the content you want to summarize..."
            className="h-28 w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-slate-500">
            {content.length} characters (minimum 50)
          </p>
        </div>

        {/* Style Selector */}
        <div>
          <label className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Summary Style
          </label>
          <div className="flex gap-2">
            {[
              { value: 'concise', label: 'Concise' },
              { value: 'detailed', label: 'Detailed' },
              { value: 'bullet_points', label: 'Bullets' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setStyle(option.value as typeof style)}
                disabled={isLoading}
                className={cn(
                  'flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  style === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summarize Button */}
      <button
        onClick={handleSummarize}
        disabled={!content.trim() || content.length < 50 || isLoading}
        className={cn(
          'mb-4 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors',
          content.trim() && content.length >= 50 && !isLoading
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Summarizing...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Summary
          </>
        )}
      </button>

      {/* Error State */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Result Section */}
      {result && (
        <div className="flex-1 overflow-hidden space-y-4">
          {/* Summary */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Summary ({result.word_count} words)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.summary}
              </p>
            </div>
          </div>

          {/* Key Points */}
          {result.key_points && result.key_points.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <List className="h-4 w-4" />
                  Key Points
                </span>
                <button
                  onClick={handleCopyKeyPoints}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <ul className="space-y-2">
                {result.key_points.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && !isLoading && !error && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-3 rounded-full bg-slate-100 dark:bg-slate-800 p-4">
            <Sparkles className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste content above and click summarize to get started
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Powered by AI
          </p>
        </div>
      )}
    </div>
  );
}
