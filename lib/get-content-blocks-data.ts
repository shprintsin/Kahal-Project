import prisma from "@/lib/prisma";
import type { ContentBlocksProps } from "@/components/ui/content-blocks";
import { pickI18n } from "@/lib/i18n/fallback";
import type { Locale } from "@/lib/i18n/config";

function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || 'https://shtetlatlas.org';

function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
  return `${MEDIA_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

type Author = { name: string; role: string; affiliation: string };

const AUTHORS_FALLBACK: Record<Locale, Author[]> = {
  he: [
    { name: 'ד"ר יניי שפיצר', role: 'חוקר ראשי', affiliation: 'האוניברסיטה העברית בירושלים' },
    { name: 'שניאור שפרינצין', role: 'עוזר מחקר', affiliation: 'האוניברסיטה העברית בירושלים' },
  ],
  en: [
    { name: 'Dr. Yannay Spitzer', role: 'Principal Investigator', affiliation: 'The Hebrew University of Jerusalem' },
    { name: 'Shneor Shprintsin', role: 'Research Assistant', affiliation: 'The Hebrew University of Jerusalem' },
  ],
};

const CITATION_FALLBACK = 'Spitzer, Y., Shprintsin, S. (2024). The Eastern European Jewish Communities Project. The Hebrew University of Jerusalem.';

export async function getContentBlocksData(locale: Locale = "he"): Promise<ContentBlocksProps> {
  const [datasets, posts, siteLinks, placeCount, datasetCount, layerCount, settings] = await Promise.all([
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
    prisma.siteSettings.findUnique({ where: { key: "global" } }),
  ]);

  const teamI18n = (settings?.researchTeam ?? {}) as Record<string, Author[]>;
  const authors: Author[] = teamI18n[locale]?.length
    ? teamI18n[locale]
    : teamI18n.he?.length
      ? teamI18n.he
      : AUTHORS_FALLBACK[locale] ?? AUTHORS_FALLBACK.he;

  const citation = pickI18n(settings?.citation, "en", CITATION_FALLBACK);

  const statsOverride = (settings?.homepageStats ?? {}) as Partial<{
    communities: string;
    datasets: string;
    maps: string;
    years: string;
  }>;

  const dateLocales: Record<string, string> = { he: "he-IL", en: "en-US" };
  const formatDate = (d: Date, locale = "he") =>
    d.toLocaleDateString(dateLocales[locale] || "he-IL", { day: "numeric", month: "long", year: "numeric" });

  return {
    datasets: datasets.map((d) => {
      const layerTypes = [...new Set(d.layers.map((a) => a.layer.type))];
      const title = pickI18n(d.title, locale, d.slug);
      const summary = pickI18n(d.summary, locale, "");
      const description = pickI18n(d.description, locale, "");
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
      title: pickI18n(p.title, locale, p.slug),
      date: formatDate(p.createdAt, locale),
      slug: p.slug,
    })),
    links: siteLinks.map((l) => ({
      title: pickI18n(l.title, locale, ""),
      description: pickI18n(l.description, locale, ""),
      icon: l.icon ?? "Globe",
      url: l.url,
    })),
    authors,
    citation,
    stats: {
      communities: statsOverride.communities ?? (placeCount > 0 ? placeCount.toLocaleString() : "1,300"),
      datasets: statsOverride.datasets ?? (datasetCount > 0 ? datasetCount.toLocaleString() : "0"),
      maps: statsOverride.maps ?? (datasetCount + layerCount).toString(),
      years: statsOverride.years ?? "1000+",
    },
  };
}
