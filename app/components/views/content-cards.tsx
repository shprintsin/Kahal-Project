"use client"

import { ArrowLeft, Calendar, Database, FileText, Layers, Map as MapIcon, Eye } from "lucide-react"
import { useLanguage } from "@/lib/i18n/language-provider"

interface MetaBadgeProps {
  children: React.ReactNode
}

function MetaBadge({ children }: MetaBadgeProps) {
  return (
    <span className="bg-surface-brand-light text-brand-primary-dark px-2 py-0.5 rounded-none text-xs font-semibold">
      {children}
    </span>
  )
}

function MetaRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
      {children}
    </div>
  )
}

function CardTitle({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl sm:text-2xl text-brand-primary mb-3 group transition-colors">
      <a href={href} className="hover:text-brand-primary">{children}</a>
    </h2>
  )
}

function CardExcerpt({ text }: { text?: string | null }) {
  if (!text) return null
  return <p className="text-body-secondary line-clamp-3 mb-4 leading-relaxed">{text}</p>
}

function CardLink({ href, label }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="mt-auto">
      <a
        href={href}
        className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </a>
    </div>
  )
}

function PlaceholderImage() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-brand-primary-light via-surface-brand-light to-stone-100 flex items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-brand-primary opacity-60">
        <rect x="8" y="16" width="48" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 40l12-8 8 6 12-10 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function CardImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className="w-full md:w-1/3 h-48 md:h-auto flex-shrink-0">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover rounded-none shadow-sm" />
      ) : (
        <PlaceholderImage />
      )}
    </div>
  )
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-border">
      {children}
    </div>
  )
}

export interface ContentItem {
  id: string | number
  title: string
  excerpt?: string | null
  thumbnail?: string | null
  slug: string
  date?: string | null
  category?: string | null
}

export interface PostItem extends ContentItem {}

export interface DatasetItem extends ContentItem {
  resourceCount?: number
}

export interface MapItem extends ContentItem {
  year?: number | null
  period?: string | null
  layerCount?: number
}

export interface LayerItem extends ContentItem {
  name: string
  type: string
  minYear?: number | null
  maxYear?: number | null
  mapCount?: number
}

export function PostCard({ item }: { item: PostItem }) {
  const { locale, t } = useLanguage()
  return (
    <CardWrapper>
      <CardImage src={item.thumbnail} alt={item.title} />
      <div className="w-full md:w-2/3 flex flex-col">
        <MetaRow>
          {item.category && <MetaBadge>{item.category}</MetaBadge>}
          {item.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
          )}
        </MetaRow>
        <CardTitle href={`/${locale}/posts/${item.slug}`}>{item.title}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={`/${locale}/posts/${item.slug}`} label={t('public.content.readMore', 'ראה עוד')} />
      </div>
    </CardWrapper>
  )
}

export function DatasetCard({ item }: { item: DatasetItem }) {
  const { locale, t } = useLanguage()
  return (
    <CardWrapper>
      <CardImage src={item.thumbnail} alt={item.title} />
      <div className="w-full md:w-2/3 flex flex-col">
        <MetaRow>
          {item.category && <MetaBadge>{item.category}</MetaBadge>}
          {item.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.date}
            </span>
          )}
          {item.resourceCount !== undefined && (
            <span className="flex items-center gap-1 font-medium text-brand-primary">
              <FileText className="w-3.5 h-3.5" />
              {item.resourceCount} {t('public.datasets.resources', 'קבצים')}
            </span>
          )}
        </MetaRow>
        <CardTitle href={item.slug.startsWith('/') ? `/${locale}${item.slug}` : item.slug}>{item.title}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={item.slug.startsWith('/') ? `/${locale}${item.slug}` : item.slug} label={t('public.content.readMore', 'ראה עוד')} />
      </div>
    </CardWrapper>
  )
}

export function MapCard({ item }: { item: MapItem }) {
  const { locale, t } = useLanguage()
  return (
    <CardWrapper>
      <CardImage src={item.thumbnail} alt={item.title} />
      <div className="w-full md:w-2/3 flex flex-col">
        <MetaRow>
          {item.category && <MetaBadge>{item.category}</MetaBadge>}
          {item.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.year}
            </span>
          )}
          {item.period && <span className="text-body-secondary font-medium">{item.period}</span>}
          {item.layerCount !== undefined && (
            <span className="flex items-center gap-1 font-medium text-brand-primary">
              <Layers className="w-3.5 h-3.5" />
              {item.layerCount} {t('public.layers.title', 'שכבות')}
            </span>
          )}
        </MetaRow>
        <CardTitle href={item.slug.startsWith('/') ? `/${locale}${item.slug}` : item.slug}>{item.title}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={item.slug.startsWith('/') ? `/${locale}${item.slug}` : item.slug} label={t('public.content.readMore', 'ראה עוד')} />
      </div>
    </CardWrapper>
  )
}

export function LayerCard({ item }: { item: LayerItem }) {
  const { locale, t } = useLanguage()
  return (
    <CardWrapper>
      <CardImage src={item.thumbnail} alt={item.name} />
      <div className="w-full flex flex-col">
        <MetaRow>
          <MetaBadge>{item.type}</MetaBadge>
          {item.category && <MetaBadge>{item.category}</MetaBadge>}
          {(item.minYear || item.maxYear) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.minYear || '?'} - {item.maxYear || '?'}
            </span>
          )}
          {item.mapCount !== undefined && item.mapCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-brand-primary">
              <Eye className="w-3.5 h-3.5" />
              {item.mapCount} {t('public.maps.title', 'מפות')}
            </span>
          )}
        </MetaRow>
        <CardTitle href={`/${locale}/layers/${item.slug}`}>{item.name}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={`/${locale}/layers/${item.slug}`} label={t('public.content.readMore', 'ראה עוד')} />
      </div>
    </CardWrapper>
  )
}
