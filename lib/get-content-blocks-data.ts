import prisma from "@/lib/prisma";
import type { ContentBlocksProps } from "@/components/ui/content-blocks";
import { resolveI18nField } from "@/lib/i18n/fallback";
import type { Locale } from "@/lib/i18n/config";

function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

function pick(json: unknown, locale: Locale, fallback: string): string {
  return resolveI18nField<string>(json as Record<string, string> | null | undefined, locale, fallback) ?? fallback;
}

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || 'https://shtetlatlas.org';

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${MEDIA_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

const AUTHORS_I18N: Record<Locale, { name: string; role: string; affiliation: string }[]> = {
  he: [
    { name: 'ד"ר יניי שפיצר', role: 'חוקר ראשי', affiliation: 'האוניברסיטה העברית בירושלים' },
    { name: 'שניאור שפרינצין', role: 'עוזר מחקר', affiliation: 'האוניברסיטה העברית בירושלים' },
  ],
  en: [
    { name: 'Dr. Yannay Spitzer', role: 'Principal Investigator', affiliation: 'The Hebrew University of Jerusalem' },
    { name: 'Shneor Shprintsin', role: 'Research Assistant', affiliation: 'The Hebrew University of Jerusalem' },
  ],
};

const CITATION = 'Spitzer, Y., Shprintsin, S. (2024). The Eastern European Jewish Communities Project. The Hebrew University of Jerusalem.';

export async function getContentBlocksData(locale: Locale = "he"): Promise<ContentBlocksProps> {
  const [datasets, posts, siteLinks, placeCount, datasetCount, layerCount] = await Promise.all([
    prisma.dataset.findMany({
      where: { status: "published" },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: {
        thumbnail: { select: { url: true } },
        _count: { select: { resources: true } },
        layers: {
          select: { layer: { select: { type: true } } },
        },
      },
    }),
    prisma.post.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.siteLink.findMany({ where: { status: "published" }, orderBy: { order: "asc" } }),
    prisma.place.count(),
    prisma.dataset.count({ where: { status: "published" } }),
    prisma.layer.count({ where: { status: "published" } }),
  ]);

  const dateLocales: Record<string, string> = { he: "he-IL", en: "en-US", pl: "pl-PL" };
  const formatDate = (d: Date, locale = "he") =>
    d.toLocaleDateString(dateLocales[locale] || "he-IL", { day: "numeric", month: "long", year: "numeric" });

  return {
    datasets: datasets.map((d) => {
      const layerTypes = [...new Set(d.layers.map((a) => a.layer.type))];
      const title = pick(d.titleI18n, locale, d.title);
      const summary = pick(d.summaryI18n, locale, d.summary ?? "");
      const description = pick(d.descriptionI18n, locale, d.description ?? "");
      const yearLabel = d.year
        ? String(d.year)
        : d.yearMin && d.yearMax && d.yearMin !== d.yearMax
          ? `${d.yearMin}–${d.yearMax}`
          : (d.yearMin ?? d.yearMax)?.toString() ?? null;
      return {
        title,
        description: summary || truncate(description),
        slug: d.slug,
        thumbnail: resolveMediaUrl(d.thumbnail?.url),
        layerTypes,
        resourceCount: d._count.resources,
        year: yearLabel,
      };
    }),
    posts: posts.map((p) => ({
      title: pick(p.titleI18n, locale, p.title),
      date: formatDate(p.createdAt, locale),
      slug: p.slug,
    })),
    links: siteLinks.map((l) => ({
      title: pick(l.titleI18n, locale, l.title),
      description: pick(l.descriptionI18n, locale, l.description ?? ""),
      icon: l.icon ?? "Globe",
      url: l.url,
    })),
    authors: AUTHORS_I18N[locale] ?? AUTHORS_I18N.he,
    citation: CITATION,
    stats: {
      communities: placeCount > 0 ? placeCount.toLocaleString() : "1,300",
      datasets: datasetCount > 0 ? datasetCount.toLocaleString() : "0",
      maps: (datasetCount + layerCount).toString(),
      years: "1000+",
    },
  };
}
