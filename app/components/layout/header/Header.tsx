import React from 'react'
import NavMenu from './NavMenu'
import { NavItem } from '@/app/types'
import Search from './Search'
import Logo from './Logo'
import styles from '../css/header.module.css'
import Link from 'next/link'


export default function Header({navigation}: {navigation: NavItem[]}) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href='/'><div className={styles.logo}></div></Link>
        <NavMenu navigation={navigation} />
        <Search/>
      </div>
    </header>
  )
}
