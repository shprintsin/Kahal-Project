"use client"

import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search as SearchIcon, Globe, ChevronDown, Menu, X, Check } from 'lucide-react'
import { NavItem } from '@/app/types'
import { DynamicIcon as GetIcons } from '@/components/ui/dynamic-icon'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter as useIntlRouter, usePathname as useIntlPathname } from '@/i18n/routing'
import { locales, localeConfig } from '@/lib/i18n/config'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header({ navigation }: { navigation: NavItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [searchExpanded, setSearchExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const intlRouter = useIntlRouter()
  const intlPathname = useIntlPathname()
  const setLanguage = (newLocale: string) => {
    intlRouter.replace(intlPathname, { locale: newLocale as any })
  }

  const currentLocaleCode = locale.toUpperCase()

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleSearchIconClick = () => {
    if (query.trim()) {
      handleSearch()
    } else {
      setSearchExpanded(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleSearchBlur = () => {
    if (!query.trim()) setSearchExpanded(false)
  }

  return (
    <header className="bg-white border-b border-gray-200 w-full relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link href={`/${locale}`} className="text-lg font-bold text-gray-900">
          {t('public.site.name')}
        </Link>

        <button
          className="lg:hidden text-gray-600 hover:text-gray-900 p-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <nav className={`${menuOpen
          ? 'flex flex-col absolute top-14 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 z-20'
          : 'hidden'} lg:flex lg:static lg:flex-row lg:border-0 lg:p-0 items-center gap-8`}
        >
          {navigation.map((item, index) => (
            <div key={index} className={item.subItems ? 'relative group' : ''}>
              <Link
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5 py-2 lg:py-0"
              >
                <GetIcons icon={item.icon ?? ""} className="w-3.5 h-3.5 opacity-60" />
                {item.label}
                {item.subItems && <ChevronDown className="w-3 h-3 opacity-40" />}
              </Link>
              {item.subItems && (
                <div className="lg:absolute lg:top-full lg:end-0 lg:pt-1 lg:opacity-0 lg:invisible group-hover:lg:opacity-100 group-hover:lg:visible transition-all z-20">
                  <div className="bg-white rounded-md shadow-lg border border-gray-100 py-1 min-w-[160px]">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-all">
                <Globe className="w-3.5 h-3.5" />
                <span className="font-medium">{currentLocaleCode}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLanguage(loc)}
                  className="flex items-center justify-between gap-2"
                >
                  <span>{localeConfig[loc].nativeName}</span>
                  {locale === loc && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center flex-row-reverse bg-gray-100 rounded-sm px-3 py-1.5">
            <SearchIcon
              className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={handleSearchIconClick}
            />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('public.search.placeholder')}
              className="bg-transparent text-xs w-32 outline-none text-gray-700 placeholder:text-gray-400 ml-2"
              dir="rtl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
