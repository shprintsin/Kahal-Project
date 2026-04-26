'use client';

import Link from 'next/link';
import { Clock, Database, ExternalLink, FileSpreadsheet, FileText, Grid3X3, Link2, Map, MapPin, Route, Scan, Users } from 'lucide-react';

import { AuthorCard } from '@/components/ui/author-card';
import { CitationBox } from '@/components/ui/citation-box';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { IconListItem } from '@/components/ui/icon-list-item';
import { SeeMoreButton } from '@/components/ui/nav-links';
import { Section } from '@/components/ui/sections';
import { StatCard } from '@/components/ui/stat-card';
import { H3 } from '@/components/ui/typography';
import { useTranslations } from 'next-intl';

interface DatasetItem {
  title: string;
  description: string;
  slug: string;
  thumbnail: string | null;
  layerTypes: string[];
  resourceCount: number;
}

interface PostItem {
  title: string;
  date: string;
  slug: string;
}

interface LinkItem {
  title: string;
  description: string;
  icon: string;
  url: string;
}

interface Author {
  name: string;
  role: string;
  affiliation: string;
}

interface Stats {
  communities: string;
  datasets: string;
  maps: string;
  years: string;
}

export interface ContentBlocksProps {
  datasets: DatasetItem[];
  posts: PostItem[];
  links: LinkItem[];
  authors: Author[];
  citation: string;
  stats: Stats;
}

const BADGE_CONFIG: Record<string, { labelKey: string | null; icon: typeof MapPin }> = {
  POINTS: { labelKey: 'public.map.points', icon: MapPin },
  POLYGONS: { labelKey: 'public.map.polygons', icon: Scan },
  MULTI_POLYGONS: { labelKey: 'public.map.polygons', icon: Scan },
  POLYLINES: { labelKey: 'public.map.polylines', icon: Route },
  RASTER: { labelKey: 'public.map.raster', icon: Grid3X3 },
  CSV: { labelKey: null, icon: FileSpreadsheet },
};

function TypeBadge({ type }: { type: string }) {
  const config = BADGE_CONFIG[type];
  const t = useTranslations();
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
      <Icon className="w-3.5 h-3.5" />
      {config.labelKey ? t(config.labelKey as Parameters<typeof t>[0]) : 'CSV'}
    </span>
  );
}

function BadgeRow({ layerTypes, resourceCount }: { layerTypes: string[]; resourceCount: number }) {
  const badges: string[] = [];
  const seen = new Set<string>();
  for (const t of layerTypes) {
    const key = t === 'MULTI_POLYGONS' ? 'POLYGONS' : t;
    if (!seen.has(key)) {
      seen.add(key);
      badges.push(t);
    }
  }
  if (resourceCount > 0) badges.push('CSV');
  if (badges.length === 0) return null;
  return (
    <div className="flex items-center gap-3">
      {badges.map((b) => <TypeBadge key={b} type={b} />)}
    </div>
  );
}

function PlaceholderThumb({ className }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-brand-primary-light via-surface-brand-light to-stone-100 flex items-center justify-center ${className || ''}`}>
      <svg width="32" height="32" viewBox="0 0 64 64" fill="none" className="text-brand-primary opacity-30">
        <rect x="8" y="16" width="48" height="32" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="22" cy="28" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 40l12-8 8 6 12-10 16 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function DataCard({ item }: { item: DatasetItem }) {
  return (
    <Link
      href={`/data/${item.slug}`}
      className="bg-surface-light border border-border overflow-hidden flex flex-col hover:shadow-md transition-shadow group"
    >
      {item.thumbnail ? (
        <img src={item.thumbnail} alt={item.title} className="w-full aspect-[3/1] object-cover" />
      ) : (
        <PlaceholderThumb className="w-full aspect-[3/1]" />
      )}
      <div className="p-3 flex flex-col gap-1.5">
        <BadgeRow layerTypes={item.layerTypes} resourceCount={item.resourceCount} />
        <h4 className="font-bold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors">{item.title}</h4>
        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">{item.description}</p>
      </div>
    </Link>
  );
}

export function ContentBlocks({
  datasets,
  posts,
  links,
  authors,
  citation,
  stats,
}: ContentBlocksProps) {
  const t = useTranslations();

  const statItems = [
    { icon: <Users className="w-5 h-5" />, label: t('public.stats.communities'), value: stats.communities },
    { icon: <Database className="w-5 h-5" />, label: t('public.stats.datasets'), value: stats.datasets },
    { icon: <Map className="w-5 h-5" />, label: t('public.stats.maps'), value: stats.maps },
    { icon: <Clock className="w-5 h-5" />, label: t('public.stats.years'), value: stats.years },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statItems.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
{/* Data */}
        <Section className="md:col-span-2 lg:col-span-4">
          <H3 className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            {t('public.sections.data')}
          </H3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {datasets.map((d) => (
              <DataCard key={d.slug} item={d} />
            ))}
          </div>
          <SeeMoreButton href="/data">{t('public.sections.allData')}</SeeMoreButton>
        </Section>
{/* Links */}
        <Section className="lg:col-span-1">
          <H3 className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {t('public.sections.links')}
          </H3>
          <ul className="space-y-3 flex-grow">
            {links.map((l) => (
              <IconListItem
                key={l.title}
                href={l.url}
                icon={<DynamicIcon icon={l.icon} className="w-4 h-4 text-brand-primary" />}
                title={l.title}
                subtitle={l.description}
                className="[&_h4]:font-semibold"
                trailing={<ExternalLink className="w-3 h-3 text-border-strong group-hover:text-brand-primary transition-colors" />}
              />
            ))}
          </ul>
        </Section>
{/* Posts */}
        <Section className="lg:col-span-1">
          <H3 className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('public.sections.posts')}
          </H3>
          <ul className="space-y-3 flex-grow">
            {posts.map((p) => (
              <IconListItem
                key={p.slug}
                href={`/posts/${p.slug}`}
                icon={<FileText className="w-4 h-4 text-brand-primary" />}
                title={p.title}
                subtitle={p.date}
              />
            ))}
          </ul>
          <SeeMoreButton href="/posts">{t('public.sections.allPosts')}</SeeMoreButton>
        </Section>

        <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-2">
          <Section className="flex-grow">
            <H3 className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('public.sections.team')}
            </H3>
            <div className="flex flex-col gap-4 flex-grow">
              {authors.map((a) => (
                <AuthorCard key={a.name} name={a.name} role={a.role} affiliation={a.affiliation} />
              ))}
            </div>
          </Section>
          <CitationBox text={citation} />
        </div>

      </div>
    </>
  );
}
