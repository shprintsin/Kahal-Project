"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useLocale } from "next-intl"
import { isRtl, isValidLocale, defaultLocale } from "@/lib/i18n/config"
import type { LucideIcon } from "lucide-react"
import type { SearchContentType } from "@/app/admin/actions/search"

export function MetaBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`MetaBadge bg-surface-brand-light text-brand-primary-dark px-2 py-0.5 rounded-none text-xs font-semibold ${className ?? ''}`}>
      {children}
    </span>
  )
}

export function MetaIconText({ icon: Icon, accent, children }: { icon: LucideIcon; accent?: boolean; children: React.ReactNode }) {
  return (
    <span className={`MetaIconText flex items-center gap-1 ${accent ? 'font-medium text-brand-primary' : ''}`}>
      <Icon className="w-3.5 h-3.5" />
      {children}
    </span>
  )
}

function MetaRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="MetaRow flex items-center gap-4 text-sm text-muted-foreground mb-2 flex-wrap">
      {children}
    </div>
  )
}

function CardTitle({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <h2 className="CardTitle font-display text-xl sm:text-2xl text-brand-primary mb-3 group transition-colors">
      <a href={href} className="hover:text-brand-primary">{children}</a>
    </h2>
  )
}

function CardExcerpt({ text }: { text?: string | null }) {
  if (!text) return null
  return <p className="CardExcerpt text-body-secondary line-clamp-3 mb-4 leading-relaxed">{text}</p>
}

function CardLink({ href, label }: { href: string; label: string }) {
  const locale = useLocale()
  const rtl = isRtl(isValidLocale(locale) ? locale : defaultLocale)
  const Arrow = rtl ? ArrowLeft : ArrowRight
  return (
    <div className="CardLink mt-auto flex justify-end">
      <a
        href={href}
        className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:gap-3 transition-all duration-200"
      >
        {label}
        <Arrow className="h-4 w-4" />
      </a>
    </div>
  )
}

function PlaceholderImage() {
  return (
    <div className="PlaceholderImage w-full h-full bg-gradient-to-br from-brand-primary-light via-surface-brand-light to-stone-100 flex items-center justify-center">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-brand-primary opacity-60">
        <rect x="8" y="16" width="48" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 40l12-8 8 6 12-10 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function CardImage({ src, alt, href }: { src?: string | null; alt: string; href: string }) {
  return (
    <div className="CardImage w-full md:w-1/3 h-48 md:h-auto flex-shrink-0">
      {src ? (
        <a href={href}>
          <img src={src} alt={alt} className="CardImage-img w-full h-full object-cover rounded-none shadow-sm" />
        </a>
      ) : (
        <PlaceholderImage />
      )}
    </div>
  )
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="CardWrapper flex flex-col md:flex-row gap-6 pb-8 border-b border-border">
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
  layerTypes?: string[]
}

export interface LayerItem extends ContentItem {
  name: string
  type: string
  minYear?: number | null
  maxYear?: number | null
  mapCount?: number
}

export interface SearchResultItem extends ContentItem {
  type: SearchContentType
}

export interface ContentCardProps {
  href: string
  title: string
  alt?: string
  excerpt?: string | null
  thumbnail?: string | null
  meta?: React.ReactNode
  linkLabel: string
  fullWidthBody?: boolean
}

export function ContentCard({
  href,
  title,
  alt,
  excerpt,
  thumbnail,
  meta,
  linkLabel,
  fullWidthBody = false,
}: ContentCardProps) {
  const bodyClass = fullWidthBody ? "w-full flex flex-col" : "w-full md:w-2/3 flex flex-col"
  return (
    <CardWrapper>
      <CardImage src={thumbnail} alt={alt ?? title} href={href} />
      <div className={`ContentCard-body ${bodyClass}`}>
        {meta && <MetaRow>{meta}</MetaRow>}
        <CardTitle href={href}>{title}</CardTitle>
        <CardExcerpt text={excerpt} />
        <CardLink href={href} label={linkLabel} />
      </div>
    </CardWrapper>
  )
}

export function useLocalizedHref(slug: string) {
  const locale = useLocale()
  return slug.startsWith('/') ? `/${locale}${slug}` : slug
}
