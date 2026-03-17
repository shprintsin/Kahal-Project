"use client";

import { Search as SearchIcon } from "lucide-react";
import React, { useRef, useState } from 'react'
import styles from '../css/header.module.css'
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/language-provider";

export default function Search() {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { locale, t } = useLanguage();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleIconClick = () => {
    if (query.trim()) {
      handleSearch();
    } else {
      setExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleBlur = () => {
    if (!query.trim()) {
      setExpanded(false);
    }
  };

  return (
    <div className={`${styles.search} ${expanded ? styles.searchExpanded : ''}`}>
      <div className={styles.searchContainer}>
        <input
          ref={inputRef}
          type="text"
          placeholder={t('public.search.placeholder', 'לחיפוש באתר')}
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
        />
        <SearchIcon
          className={`${styles.searchIcon} cursor-pointer hover:text-brand-primary transition-colors duration-200`}
          onClick={handleIconClick}
        />
      </div>
    </div>
  )
}
