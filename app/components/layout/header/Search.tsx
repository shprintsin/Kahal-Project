"use client";

import { FaSearch } from "react-icons/fa";
import React, { useState } from 'react'
import styles from '../css/header.module.css'
import { useRouter } from "next/navigation";

export default function Search() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={styles.search}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="לחיפוש באתר"
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <FaSearch 
          className={`${styles.searchIcon} cursor-pointer hover:text-[var(--dark-green)] transition-colors duration-200`} 
          onClick={handleSearch}
        />
      </div>
    </div>
  )
}
