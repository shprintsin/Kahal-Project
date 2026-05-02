import React from 'react';
import { cn } from '@/lib/utils';
import { type DocumentV2Locale } from '@/types/document-v2';

const LANG_CODE: Record<DocumentV2Locale, string> = {
  he: 'HE',
  en: 'EN',
  pl: 'PL',
  ru: 'RU',
  yi: 'YI',
};

/**
 * Chip strip showing which languages a document is available in. The source
 * language renders as a filled accent chip, present translations as outlined
 * accent chips. `onActive` flips colors for use over the dark active-card bg.
 */
export function LangAvailChips({
  sourceLang,
  availableLangs,
  onActive = false,
}: {
  sourceLang: DocumentV2Locale;
  availableLangs: DocumentV2Locale[];
  onActive?: boolean;
}) {
  const ordered: { lang: DocumentV2Locale; state: 'src' | 'has' }[] = [
    { lang: sourceLang, state: 'src' },
  ];
  for (const lang of availableLangs) {
    if (lang === sourceLang) continue;
    ordered.push({ lang, state: 'has' });
  }

  return (
    <span className="inline-flex gap-1" aria-hidden>
      {ordered.map(({ lang, state }) => (
        <span
          key={`${lang}-${state}`}
          dir="ltr"
          className={cn(
            'border px-1 py-px text-[9px] font-medium leading-none tracking-wider',
            state === 'src' && !onActive && 'border-[var(--docs-accent)] bg-[var(--docs-accent)] text-[var(--docs-paper)]',
            state === 'src' && onActive && 'border-[var(--docs-paper)] bg-[var(--docs-paper)] text-[var(--brand-primary)]',
            state === 'has' && !onActive && 'border-[var(--docs-accent)] bg-transparent text-[var(--docs-accent)]',
            state === 'has' && onActive && 'border-[var(--docs-paper)] bg-transparent text-[var(--docs-paper)]',
          )}
        >
          {LANG_CODE[lang]}
        </span>
      ))}
    </span>
  );
}
