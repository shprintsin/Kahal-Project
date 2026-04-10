"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export interface PostCardProps {
  post: {
    id: string | number
    title: string
    excerpt?: string
    thumbnail?: string | null
    slug: string
    date?: string | null
  }
}

export default function PostCard({ post }: PostCardProps) {
  const locale = useLocale()
  const t = useTranslations()
  const isRtl = locale === 'he'
  const Arrow = isRtl ? ArrowLeft : ArrowRight
  const href = post.slug.startsWith('/') ? `/${locale}${post.slug}` : post.slug

  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-border">
      <div className="w-full md:w-1/3 h-48 md:h-auto">
        <img
          src={post.thumbnail || "/placeholder.svg"}
          alt={post.title}
          className="w-full h-full object-cover rounded-md"
        />
      </div>
      <div className="w-full md:w-2/3 flex flex-col">
        {post.date && <div className="text-sm text-muted-foreground mb-2">{post.date}</div>}
        <h2 className="font-display text-xl sm:text-2xl text-brand-primary mb-3">{post.title}</h2>
        {post.excerpt && <p className="text-base mb-4">{post.excerpt}</p>}
        <div className="mt-auto">
          <a
            href={href}
            className="flex justify-between items-center text-brand-secondary hover:text-brand-primary transition-colors duration-200"
          >
            <span className="font-display font-bold">{t('public.content.readMore')}</span>
            <Arrow className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  )
}
