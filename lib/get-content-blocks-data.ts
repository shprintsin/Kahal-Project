import prisma from "@/lib/prisma";
import type { ContentBlocksProps } from "@/components/ui/content-blocks";

function truncate(text: string, maxLen = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

const AUTHORS = [
  { name: 'ד"ר יניי שפיצר', role: 'חוקר ראשי', affiliation: 'האוניברסיטה העברית בירושלים' },
  { name: 'שניאור שפרינצין', role: 'עוזר מחקר', affiliation: 'האוניברסיטה העברית בירושלים' },
];

const CITATION = 'Spitzer, Y., Shprintsin, S. (2024). The Eastern European Jewish Communities Project. The Hebrew University of Jerusalem.';

export async function getContentBlocksData(): Promise<ContentBlocksProps> {
  const featuredDatasets = await prisma.dataset.findMany({ where: { status: "published", isFeatured: true }, orderBy: { createdAt: "desc" }, take: 4 });
  const featuredMaps = await prisma.dataset.findMany({ where: { status: "published", isFeatured: true }, orderBy: { createdAt: "desc" }, take: 4 });
  const featuredLayers = await prisma.layer.findMany({ where: { status: "published", isFeatured: true }, orderBy: { createdAt: "desc" }, take: 4 });

  const [datasets, maps, layers, posts, siteLinks, placeCount, datasetCount, mapCount, layerCount] = await Promise.all([
    featuredDatasets.length > 0
      ? Promise.resolve(featuredDatasets)
      : prisma.dataset.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    featuredMaps.length > 0
      ? Promise.resolve(featuredMaps)
      : prisma.dataset.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    featuredLayers.length > 0
      ? Promise.resolve(featuredLayers)
      : prisma.layer.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.post.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.siteLink.findMany({ where: { status: "published" }, orderBy: { order: "asc" } }),
    prisma.place.count(),
    prisma.dataset.count({ where: { status: "published" } }),
    prisma.dataset.count({ where: { status: "published" } }),
    prisma.layer.count({ where: { status: "published" } }),
  ]);

  const dateLocales: Record<string, string> = { he: "he-IL", en: "en-US", pl: "pl-PL" };
  const formatDate = (d: Date, locale = "he") =>
    d.toLocaleDateString(dateLocales[locale] || "he-IL", { day: "numeric", month: "long", year: "numeric" });

  return {
    datasets: datasets.map((d) => ({ title: d.title, description: d.summary || truncate(d.description ?? ""), slug: d.slug })),
    maps: [
      ...maps.map((m) => ({ title: m.title, description: m.summary || truncate(m.description ?? ""), href: `/maps/${m.slug}` })),
      ...layers.map((l) => ({ title: l.name, description: l.summary || truncate(l.description ?? ""), href: `/layers/${l.slug}` })),
    ].slice(0, 4),
    posts: posts.map((p) => ({ title: p.title, date: formatDate(p.createdAt, "he"), slug: p.slug })),
    links: siteLinks.map((l) => ({ title: l.title, description: l.description ?? "", icon: l.icon ?? "Globe", url: l.url })),
    authors: AUTHORS,
    citation: CITATION,
    stats: {
      communities: placeCount > 0 ? placeCount.toLocaleString() : "3,200",
      datasets: datasetCount > 0 ? datasetCount.toLocaleString() : "0",
      maps: (mapCount + layerCount).toString(),
      years: "1000+",
    },
  };
}
