import Link from 'next/link'
import { defaultLocale } from '@/lib/i18n/config'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-light flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-brand-primary font-display mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">הדף לא נמצא</h2>
        <p className="text-muted-foreground mb-8">
          הדף שחיפשת אינו קיים או שהוסר.
        </p>
        <Link
          href={`/${defaultLocale}`}
          className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-primary-dark transition-colors"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  )
}
