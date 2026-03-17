'use client';

import { useState } from 'react';
import { FileText, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SummarizePanel() {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSummarize = async () => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    // Simulate summarization (replace with actual API call)
    setTimeout(() => {
      setSummary(
        'This is a simulated summary of your content. Connect to your AI backend to generate real summaries. The summary will highlight key points and main ideas from the text you provided.'
      );
      setIsLoading(false);
    }, 1500);
  };

  const handleCopy = async () => {
    if (!summary) return;
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col p-4">
      {/* Input Section */}
      <div className="mb-4">
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <FileText className="h-4 w-4" />
          Content to summarize
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste the content you want to summarize..."
          className="h-32 w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={isLoading}
        />
      </div>

      {/* Summarize Button */}
      <button
        onClick={handleSummarize}
        disabled={!content.trim() || isLoading}
        className={cn(
          'mb-4 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors',
          content.trim() && !isLoading
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

      {/* Summary Output */}
      {summary && (
        <div className="flex-1 overflow-hidden">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Summary
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
          <div className="h-full overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {summary}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!summary && !isLoading && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="mb-3 rounded-full bg-slate-100 dark:bg-slate-800 p-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste content above and click summarize to get started
          </p>
        </div>
      )}
    </div>
  );
}
