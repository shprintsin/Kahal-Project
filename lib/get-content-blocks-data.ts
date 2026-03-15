import prisma from "@/lib/prisma";
import type { ContentBlocksProps } from "@/components/ui/content-blocks";

const AUTHORS = [
  { name: 'ד"ר יניי שפיצר', role: 'חוקר ראשי', affiliation: 'האוניברסיטה העברית בירושלים' },
  { name: 'שניאור שפרינצין', role: 'עוזר מחקר', affiliation: 'האוניברסיטה העברית בירושלים' },
];

const CITATION = 'Spitzer, Y., Shprintsin, S. (2024). The Eastern European Jewish Communities Project. The Hebrew University of Jerusalem.';

export async function getContentBlocksData(): Promise<ContentBlocksProps> {
  const [datasets, maps, layers, posts, siteLinks, placeCount, artifactCount] = await Promise.all([
    prisma.researchDataset.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.map.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.layer.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.post.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.siteLink.findMany({ where: { status: "published" }, orderBy: { order: "asc" } }),
    prisma.place.count(),
    prisma.artifact.count(),
  ]);

  const formatDate = (d: Date) => d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });

  return {
    datasets: datasets.map((d) => ({ title: d.title, description: d.description ?? "", slug: d.slug })),
    maps: [
      ...maps.map((m) => ({ title: m.title, description: m.description ?? "", href: `/maps/${m.slug}` })),
      ...layers.map((l) => ({ title: l.name, description: l.description ?? "", href: `/layers/${l.slug}` })),
    ].slice(0, 4),
    posts: posts.map((p) => ({ title: p.title, date: formatDate(p.createdAt), slug: p.slug })),
    links: siteLinks.map((l) => ({ title: l.title, description: l.description ?? "", icon: l.icon ?? "Globe", url: l.url })),
    authors: AUTHORS,
    citation: CITATION,
    stats: {
      communities: placeCount > 0 ? placeCount.toLocaleString() : "3,200",
      documents: artifactCount > 0 ? artifactCount.toLocaleString() : "15,800",
      maps: (maps.length + layers.length).toString(),
      years: "1000+",
    },
  };
}
