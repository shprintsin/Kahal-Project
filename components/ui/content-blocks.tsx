'use client';

import { Clock, Database, ExternalLink, FileText, Layers, Link2, Map, Users } from 'lucide-react';

import { AuthorCard } from '@/components/ui/author-card';
import { CitationBox } from '@/components/ui/citation-box';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { GridTile } from '@/components/ui/grid-tile';
import { IconListItem } from '@/components/ui/icon-list-item';
import { SeeMoreButton } from '@/components/ui/nav-links';
import { Section } from '@/components/ui/sections';
import { StatCard } from '@/components/ui/stat-card';
import { H3 } from '@/components/ui/typography';

interface DatasetItem {
  title: string;
  description: string;
  slug: string;
}

interface MapLayerItem {
  title: string;
  description: string;
  href: string;
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
  documents: string;
  maps: string;
  years: string;
}

export interface ContentBlocksProps {
  datasets: DatasetItem[];
  maps: MapLayerItem[];
  posts: PostItem[];
  links: LinkItem[];
  authors: Author[];
  citation: string;
  stats: Stats;
}

export function ContentBlocks({
  datasets,
  maps,
  posts,
  links,
  authors,
  citation,
  stats,
}: ContentBlocksProps) {
  const statItems = [
    { icon: <Users className="w-5 h-5" />, label: 'קהילות', value: stats.communities },
    { icon: <FileText className="w-5 h-5" />, label: 'מסמכים', value: stats.documents },
    { icon: <Map className="w-5 h-5" />, label: 'מפות', value: stats.maps },
    { icon: <Clock className="w-5 h-5" />, label: 'שנות היסטוריה', value: stats.years },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statItems.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">

        <Section className="md:col-span-2 lg:col-span-2">
          <H3 className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            נתונים
          </H3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
            {datasets.map((d) => (
              <GridTile key={d.slug} href={`/data/${d.slug}`} title={d.title} description={d.description} />
            ))}
          </div>
          <SeeMoreButton href="/data">כל הנתונים</SeeMoreButton>
        </Section>

        <Section className="md:col-span-2 lg:col-span-2">
          <H3 className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            מפות ושכבות
          </H3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
            {maps.map((m) => (
              <GridTile key={m.href} href={m.href} title={m.title} description={m.description} />
            ))}
          </div>
          <SeeMoreButton href="/maps">כל המפות</SeeMoreButton>
        </Section>

        <Section className="lg:col-span-1">
          <H3 className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            קישורים
          </H3>
          <ul className="space-y-3 flex-grow">
            {links.map((l) => (
              <IconListItem
                key={l.title}
                href={l.url}
                icon={<DynamicIcon icon={l.icon} className="w-4 h-4 text-emerald-700" />}
                title={l.title}
                subtitle={l.description}
                className="[&_h4]:font-semibold"
                trailing={<ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-emerald-600 transition-colors" />}
              />
            ))}
          </ul>
        </Section>

        <Section className="lg:col-span-1">
          <H3 className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            פוסטים
          </H3>
          <ul className="space-y-3 flex-grow">
            {posts.map((p) => (
              <IconListItem
                key={p.slug}
                href={`/posts/${p.slug}`}
                icon={<FileText className="w-4 h-4 text-emerald-700" />}
                title={p.title}
                subtitle={p.date}
              />
            ))}
          </ul>
          <SeeMoreButton href="/posts">כל הפוסטים</SeeMoreButton>
        </Section>

        <div className="flex flex-col gap-6 md:col-span-2 lg:col-span-2">
          <Section className="flex-grow">
            <H3 className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              צוות המחקר
            </H3>
            <div className="flex flex-col gap-4 flex-grow">
              {authors.map((a) => (
                <AuthorCard key={a.name} name={a.name} role={a.role} affiliation={a.affiliation} />
              ))}
            </div>
          </Section>
          <CitationBox text={citation} variant="inline" />
        </div>

      </div>
    </>
  );
}
