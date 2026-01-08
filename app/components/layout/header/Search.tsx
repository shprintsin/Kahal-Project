import { FaSearch } from "react-icons/fa";
import React from 'react'
import styles from '../css/header.module.css'

export default function Search() {
  return (
    <div className={styles.search}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="לחיפוש באתר"
          className={styles.searchInput}
        />
        <FaSearch className={styles.searchIcon} />
      </div>
    </div>
  )
}
