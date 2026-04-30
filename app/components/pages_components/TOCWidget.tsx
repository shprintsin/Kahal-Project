import type { TocHeading } from '@/lib/toc'
import { cn } from '@/lib/utils'

export function TOCWidget({
  headings,
  title = 'תוכן עניינים',
}: {
  headings: TocHeading[]
  title?: string
}) {
  if (!headings.length) return null

  return (
    <nav aria-label={title} className="text-sm">
      <h2 className="font-display text-base font-semibold text-brand-primary mb-3 uppercase tracking-wide">
        {title}
      </h2>
      <ul className="space-y-1.5 border-s border-gray-200 ps-4">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block py-1 text-body-secondary hover:text-brand-primary transition-colors leading-snug',
                h.level === 3 && 'ps-3 text-[0.8125rem]',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
