'use client'

import { useState } from 'react'
import { FaFileAlt, FaGithub, FaCode } from 'react-icons/fa'
import { HeroFooter, FooterLink } from '@/components/ui/page-layout'
import { useLocale } from 'next-intl'

const labels: Record<string, { docs: string; github: string; api: string; apiAlert: string }> = {
  he: { docs: 'דוקומנטציה', github: 'GITHUB', api: 'API', apiAlert: 'בפיתוח' },
  en: { docs: 'Documentation', github: 'GITHUB', api: 'API', apiAlert: 'In Development' },
}

export function DevLinksStrip() {
  const locale = useLocale()
  const l = labels[locale] || labels.en
  const [showToast, setShowToast] = useState(false)

  const handleApiClick = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  return (
    <HeroFooter className="relative">
      <FooterLink
        href={`/${locale}/docs`}
        icon={<FaFileAlt className="w-5 h-5" />}
        label={l.docs}
      />
      <FooterLink
        href="https://github.com/shprintsin/shtetlatlas_data"
        icon={<FaGithub className="w-5 h-5" />}
        label={l.github}
      />
      <div className="relative">
        <FooterLink
          href="#"
          icon={<FaCode className="w-5 h-5" />}
          label={l.api}
          onClick={handleApiClick}
        />
        {showToast && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-foreground text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in-out">
            {l.apiAlert}
          </span>
        )}
      </div>
    </HeroFooter>
  )
}
