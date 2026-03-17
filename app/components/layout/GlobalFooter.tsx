"use client"

import React from 'react';
import { useLanguage } from '@/lib/i18n/language-provider';

interface FooterLink {
  label: string;
  href: string;
}

interface GlobalFooterProps {
  links: FooterLink[];
  copyrightText: string;
}

export default function GlobalFooter({ links, copyrightText }: GlobalFooterProps) {
  const { t, locale } = useLanguage();
  return (
    <footer className="bg-brand-primary-dark text-white py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('public.footer.about')}</h3>
            <p className="text-xs sm:text-sm">
              {t('public.footer.aboutText')}
            </p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('public.footer.contact')}</h3>
            <p className="text-xs sm:text-sm">info@example.ac.il</p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">{t('public.footer.privacyPolicy')}</h3>
            <ul className="text-xs sm:text-sm space-y-2">
              <li>
                <a href={`/${locale}/privacy`} className="hover:underline">{t('public.footer.privacy')}</a>
              </li>
              <li>
                <a href={`/${locale}/terms`} className="hover:underline">{t('public.footer.terms')}</a>
              </li>
              <li>
                <a href={`/${locale}/accessibility`} className="hover:underline">{t('public.footer.accessibility')}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border-footer text-center text-xs sm:text-sm">
          <p>{t('public.footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
