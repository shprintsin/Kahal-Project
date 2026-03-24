"use client"

import React, { useState } from 'react'
import NavMenu from './NavMenu'
import { NavItem } from '@/app/types'
import Search from './Search'
import styles from '../css/header.module.css'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/language-provider'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function Header({ navigation }: { navigation: NavItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { locale, t } = useLanguage()

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href={`/${locale}`}><div className={styles.logo}>{t('public.site.name', 'ShtetlAtlas')}</div></Link>
        <button
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
        <NavMenu navigation={navigation} isOpen={menuOpen} />
        <Search />
        <LanguageSwitcher />
      </div>
    </header>
  )
}
