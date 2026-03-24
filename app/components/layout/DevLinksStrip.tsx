'use client'

import { FaFileAlt, FaGithub, FaCode } from 'react-icons/fa'
import { HeroFooter, FooterLink } from '@/components/ui/page-layout'
import { useLanguage } from '@/lib/i18n/language-provider'

const labels: Record<string, { docs: string; github: string; api: string; apiAlert: string }> = {
  he: { docs: 'דוקומנטציה', github: 'GITHUB', api: 'API', apiAlert: 'בפיתוח' },
  en: { docs: 'Documentation', github: 'GITHUB', api: 'API', apiAlert: 'In Development' },
  pl: { docs: 'Dokumentacja', github: 'GITHUB', api: 'API', apiAlert: 'W trakcie rozwoju' },
  yi: { docs: 'דאָקומענטאַציע', github: 'GITHUB', api: 'API', apiAlert: 'אין אַנטוויקלונג' },
}

export function DevLinksStrip() {
  const { locale } = useLanguage()
  const l = labels[locale] || labels.en

  return (
    <HeroFooter>
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
      <FooterLink
        href="#"
        icon={<FaCode className="w-5 h-5" />}
        label={l.api}
        onClick={() => alert(l.apiAlert)}
      />
    </HeroFooter>
  )
}
