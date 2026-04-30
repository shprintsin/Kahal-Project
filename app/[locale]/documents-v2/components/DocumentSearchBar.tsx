'use client';

import React, { useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SearchScope = 'doc' | 'all';

interface DocumentSearchBarProps {
  scope: SearchScope;
  onScopeChange: (s: SearchScope) => void;
  onSubmit: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  resultsCount: number | null;
  initialQuery?: string;
  labels: {
    placeholder: string;
    submit: string;
    clear: string;
    scopeDoc: string;
    scopeAll: string;
    resultsCount: (n: number) => string;
    noResults: string;
  };
}

export function DocumentSearchBar({
  scope,
  onScopeChange,
  onSubmit,
  onClear,
  isLoading,
  resultsCount,
  initialQuery = '',
  labels,
}: DocumentSearchBarProps) {
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q.length === 0) return;
    onSubmit(q);
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 border-b px-3 py-2"
      style={{
        background: 'var(--docs-cream)',
        borderColor: 'var(--docs-cream-3)',
      }}
    >
      <label
        className="flex flex-1 min-w-[200px] items-center gap-2 border bg-[var(--docs-paper)] px-2.5 py-1.5"
        style={{ borderColor: 'var(--docs-cream-3)' }}
      >
        <Search className="h-3.5 w-3.5 text-[var(--muted-foreground)]" aria-hidden />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleClear();
            }
          }}
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 bg-transparent text-[12px] focus:outline-none"
          spellCheck={false}
          autoFocus
        />
      </label>

      <div
        className="inline-flex border text-[10px] uppercase tracking-[0.06em]"
        style={{
          fontFamily: 'var(--font-docs-mono)',
          borderColor: 'var(--docs-cream-3)',
        }}
      >
        <button
          type="button"
          onClick={() => onScopeChange('doc')}
          className={cn(
            'px-2.5 py-1 transition-colors',
            scope === 'doc'
              ? 'bg-[var(--docs-accent)] text-[var(--docs-paper)]'
              : 'bg-[var(--docs-paper)] text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]',
          )}
        >
          {labels.scopeDoc}
        </button>
        <button
          type="button"
          onClick={() => onScopeChange('all')}
          className={cn(
            'border-s px-2.5 py-1 transition-colors',
            scope === 'all'
              ? 'bg-[var(--docs-accent)] text-[var(--docs-paper)]'
              : 'bg-[var(--docs-paper)] text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]',
          )}
          style={{ borderColor: 'var(--docs-cream-3)' }}
        >
          {labels.scopeAll}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading || value.trim().length === 0}
        title={labels.submit}
        aria-label={labels.submit}
        className={cn(
          'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px]',
          'bg-[var(--docs-paper)] text-[var(--brand-primary)] hover:bg-[var(--docs-cream-2)]',
          'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--docs-paper)]',
        )}
        style={{ borderColor: 'var(--docs-cream-3)', fontFamily: 'var(--font-docs-mono)' }}
      >
        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        {labels.submit}
      </button>

      {resultsCount !== null && (
        <span
          className="select-none whitespace-nowrap text-[11px] text-[var(--muted-foreground)]"
          style={{ fontFamily: 'var(--font-docs-mono)' }}
        >
          {resultsCount === 0 ? labels.noResults : labels.resultsCount(resultsCount)}
        </span>
      )}

      {(value.length > 0 || resultsCount !== null) && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={labels.clear}
          title={labels.clear}
          className="p-1 text-[var(--muted-foreground)] hover:text-[var(--brand-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
