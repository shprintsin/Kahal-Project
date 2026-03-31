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
      return {
        title: d.title,
        description: d.summary || truncate(d.description ?? ""),
        slug: d.slug,
        thumbnail: d.thumbnail?.url || null,
        layerTypes,
        resourceCount: d._count.resources,
      };
    }),
    posts: posts.map((p) => ({ title: p.title, date: formatDate(p.createdAt, "he"), slug: p.slug })),
    links: siteLinks.map((l) => ({ title: l.title, description: l.description ?? "", icon: l.icon ?? "Globe", url: l.url })),
    authors: AUTHORS,
    citation: CITATION,
    stats: {
      communities: placeCount > 0 ? placeCount.toLocaleString() : "3,200",
      datasets: datasetCount > 0 ? datasetCount.toLocaleString() : "0",
      maps: (datasetCount + layerCount).toString(),
      years: "1000+",
    },
  };
}
