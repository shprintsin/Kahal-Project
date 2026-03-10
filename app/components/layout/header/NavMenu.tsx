import { NavItem } from '@/app/types'
import React from 'react'
import styles from '../css/header.module.css'
import {
  FaChevronDown,
} from "react-icons/fa"
import { GetIcons } from '@/app/Data'



export default function NavMenu({navigation, mobile}: {navigation: NavItem[], mobile?: boolean}) {
  if (mobile) {
    return (
      <nav className={styles.navMobile}>
        {navigation.map((item, index) => (
          <div key={index}>
            <a href={item.href} className={styles.navLinkMobile}>
              <GetIcons icon={item.icon ?? ""} className="ml-2 text-xl" />
              {item.label}
            </a>
            {item.subItems && (
              <div className={styles.dropdownMobileList}>
                {item.subItems.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    href={subItem.href}
                    className={styles.dropdownItem}
                  >
                    {subItem.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    )
  }

  return (
    <nav className={styles.nav}>
      {navigation.map((item, index) => (
        <div key={index} className={item.subItems ? styles.navItem : ""}>
          <a href={item.href} className={styles.navLink}>
            <GetIcons icon={item.icon ?? ""} className="ml-2 text-xl" />
            {item.label}
            {item.subItems && <FaChevronDown className={styles.dropdownIcon} />}
          </a>
          {item.subItems && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownContent}>
                <div className={styles.dropdownList}>
                  {item.subItems.map((subItem, subIndex) => (
                    <a
                      key={subIndex}
                      href={subItem.href}
                      className={styles.dropdownItem}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}
