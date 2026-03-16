"use client"

import { Calendar, Database, FileText, Layers, Map as MapIcon, Eye } from "lucide-react"

interface MetaBadgeProps {
  children: React.ReactNode
}

function MetaBadge({ children }: MetaBadgeProps) {
  return (
    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-none text-xs font-semibold">
      {children}
    </span>
  )
}

function MetaRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2 rtl-dir flex-wrap">
      {children}
    </div>
  )
}

function CardTitle({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <h2 className="secular text-xl sm:text-2xl text-[var(--dark-green)] mb-3 group transition-colors">
      <a href={href} className="hover:text-emerald-700">{children}</a>
    </h2>
  )
}

function CardExcerpt({ text }: { text?: string | null }) {
  if (!text) return null
  return <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">{text}</p>
}

function CardLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="mt-auto">
      <a
        href={href}
        className="inline-flex items-center gap-2 text-emerald-700 font-bold secular hover:translate-x-[-4px] transition-transform duration-200"
      >
        {label}
        {icon}
      </a>
    </div>
  )
}

function CardImage({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) return null
  return (
    <div className="w-full md:w-1/3 h-48 md:h-auto flex-shrink-0">
      <img src={src} alt={alt} className="w-full h-full object-cover rounded-none shadow-sm" />
    </div>
  )
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200">
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
        <CardTitle href={`/posts/${item.slug}`}>{item.title}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={`/posts/${item.slug}`} label="קרא עוד" icon={<FileText className="h-4 w-4" />} />
      </div>
    </CardWrapper>
  )
}

export function DatasetCard({ item }: { item: DatasetItem }) {
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
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <FileText className="w-3.5 h-3.5" />
              {item.resourceCount} קבצים
            </span>
          )}
        </MetaRow>
        <CardTitle href={item.slug}>{item.title}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={item.slug} label="צפה במאגר המלא" icon={<Database className="h-4 w-4" />} />
      </div>
    </CardWrapper>
  )
}

export function MapCard({ item }: { item: MapItem }) {
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
          {item.period && <span className="text-gray-600 font-medium">{item.period}</span>}
          {item.layerCount !== undefined && (
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <Layers className="w-3.5 h-3.5" />
              {item.layerCount} שכבות
            </span>
          )}
        </MetaRow>
        <CardTitle href={item.slug}>{item.title}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={item.slug} label="צפה במפה" icon={<MapIcon className="h-4 w-4" />} />
      </div>
    </CardWrapper>
  )
}

export function LayerCard({ item }: { item: LayerItem }) {
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
            <span className="flex items-center gap-1 font-medium text-emerald-700">
              <Eye className="w-3.5 h-3.5" />
              בשימוש ב-{item.mapCount} מפות
            </span>
          )}
        </MetaRow>
        <CardTitle href={`/layers/${item.slug}`}>{item.name}</CardTitle>
        <CardExcerpt text={item.excerpt} />
        <CardLink href={`/layers/${item.slug}`} label="צפה בשכבה" icon={<Layers className="h-4 w-4" />} />
      </div>
    </CardWrapper>
  )
}
