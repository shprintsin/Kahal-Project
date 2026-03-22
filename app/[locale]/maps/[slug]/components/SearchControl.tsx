'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface SearchFeature {
  properties: Record<string, unknown>;
  id?: string;
}

export interface SearchControlProps {
  features: SearchFeature[];
  searchField: string;
  onSelect: (featureId: string) => void;
}

interface SearchResult {
  featureId: string;
  displayValue: string;
}

function searchFeatures(features: SearchFeature[], field: string, query: string): SearchResult[] {
  if (!query || query.trim() === '') return [];
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  for (const feature of features) {
    if (results.length >= 10) break;
    const val = feature.properties[field];
    if (val == null) continue;
    const strVal = String(val);
    if (strVal.toLowerCase().includes(lowerQuery)) {
      results.push({ featureId: feature.id ?? strVal, displayValue: strVal });
    }
  }
  return results;
}

export function SearchControl({ features, searchField, onSelect }: SearchControlProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const found = searchFeatures(features, searchField, value);
      setResults(found);
      setIsOpen(found.length > 0);
    }, 300);
  }, [features, searchField]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="search-control" ref={containerRef} style={{ position: 'absolute', top: 12, left: 50, zIndex: 800, minWidth: 220 }}>
      <input
        type="text"
        placeholder={`Search by ${searchField}...`}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: '1px solid #ccc', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', outline: 'none', boxSizing: 'border-box' }}
      />
      {isOpen && results.length > 0 && (
        <div style={{ background: 'white', border: '1px solid #ccc', borderTop: 'none', borderRadius: '0 0 6px 6px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)', maxHeight: 240, overflowY: 'auto' }}>
          {results.map((result, idx) => (
            <div
              key={result.featureId + '-' + idx}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f0f0f0', color: '#333' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#f5f5f5'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'white'; }}
              onClick={() => { onSelect(result.featureId); setIsOpen(false); setQuery(result.displayValue); }}
            >
              {result.displayValue}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
