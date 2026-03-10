'use client';

import React, { useState } from 'react'
import NavMenu from './NavMenu'
import { NavItem } from '@/app/types'
import Search from './Search'
import styles from '../css/header.module.css'
import Link from 'next/link'
import { FaBars, FaTimes } from 'react-icons/fa'


export default function Header({navigation}: {navigation: NavItem[]}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href='/'><div className={styles.logo}></div></Link>

        <div className={styles.desktopNav}>
          <NavMenu navigation={navigation} />
        </div>

        <div className={styles.desktopSearch}>
          <Search/>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <NavMenu navigation={navigation} mobile />
          <div className={styles.mobileSearch}>
            <Search/>
          </div>
        </div>
      )}
    </header>
  )
}
