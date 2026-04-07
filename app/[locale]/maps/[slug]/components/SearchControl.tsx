"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

/* ── Shared glass style ──────────────────────────────────── */
const GLASS: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
};

/* ── Types ───────────────────────────────────────────────── */
export interface SearchFeature {
  id: string;
  label: string;
  sublabel?: string;
  coordinates: [number, number];
  bbox?: [number, number, number, number];
}

export interface SearchControlProps {
  features: SearchFeature[];
  onSelect: (feature: SearchFeature) => void;
  placeholder?: string;
}

/* ── Relevance search: starts-with first, then includes ─── */
function rankResults(features: SearchFeature[], query: string): SearchFeature[] {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const startsWithList: SearchFeature[] = [];
  const containsList: SearchFeature[] = [];

  for (const f of features) {
    const labelLower = f.label.toLowerCase();
    if (labelLower.startsWith(lower)) startsWithList.push(f);
    else if (labelLower.includes(lower)) containsList.push(f);
    if (startsWithList.length + containsList.length >= 10) break;
  }
  return [...startsWithList, ...containsList].slice(0, 10);
}

/* ── Component ───────────────────────────────────────────── */
export function SearchControl({ features, onSelect, placeholder }: SearchControlProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayPlaceholder = placeholder ?? 'Search...';

  /* Debounced search */
  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIdx(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const found = rankResults(features, value);
      setResults(found);
      setIsOpen(found.length > 0);
    }, 200);
  }, [features]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Cleanup debounce */
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  /* Select a result */
  const selectResult = useCallback((feature: SearchFeature) => {
    setQuery(feature.label);
    setIsOpen(false);
    setActiveIdx(-1);
    onSelect(feature);
  }, [onSelect]);

  /* Keyboard navigation */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Escape') { setQuery(''); setResults([]); setIsOpen(false); }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIdx(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIdx(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIdx >= 0 && activeIdx < results.length) selectResult(results[activeIdx]);
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIdx(-1);
        break;
    }
  }, [isOpen, results, activeIdx, selectResult]);

  /* Clear */
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  }, []);

  return (
    <div ref={containerRef} className="search-control" style={{ position: 'absolute', top: 16, left: 56, zIndex: 800, width: 280 }}>
      {/* Input bar */}
      <div style={{ ...GLASS, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 8 }}>
        <Search size={16} strokeWidth={2} color="#9CA3AF" style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={displayPlaceholder}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: 13,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: '#111827',
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
              display: 'flex', alignItems: 'center', color: '#9CA3AF',
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      {isOpen && results.length > 0 && (
        <div style={{
          ...GLASS,
          marginTop: 4,
          padding: '4px 0',
          maxHeight: 280,
          overflowY: 'auto',
        }}>
          {results.map((feature, idx) => (
            <div
              key={feature.id}
              role="option"
              aria-selected={idx === activeIdx}
              onClick={() => selectResult(feature)}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: 13,
                color: '#374151',
                backgroundColor: idx === activeIdx ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                transition: 'background-color 0.1s ease',
              }}
            >
              <div style={{ fontWeight: 500 }}>{feature.label}</div>
              {feature.sublabel && (
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{feature.sublabel}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
