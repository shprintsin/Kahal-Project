"use client"

import React, { useState } from 'react'
import NavMenu from './NavMenu'
import { NavItem } from '@/app/types'
import Search from './Search'
import styles from '../css/header.module.css'
import Link from 'next/link'

export default function Header({ navigation }: { navigation: NavItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/"><div className={styles.logo}>קהל</div></Link>
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <NavMenu navigation={navigation} isOpen={menuOpen} />
        <Search />
      </div>
    </header>
  )
}
