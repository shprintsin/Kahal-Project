import { LayersClientPage } from "./layers-client-page";
import prisma from "@/lib/prisma";
import { pickI18n } from "@/lib/i18n/fallback";

async function getLayers() {
  const layers = await prisma.layer.findMany({
    include: {
      category: {
        select: {
          title: true,
        },
      },
      _count: {
        select: {
          datasets: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return layers;
}

export default async function LayersPage() {
  const layers = await getLayers();
  const normalized = layers.map((l: any) => ({
    ...l,
    name: pickI18n(l.name, 'en'),
    summary: typeof l.summary === 'string' ? l.summary : pickI18n(l.summary, 'en', '') || null,
    category: l.category ? { ...l.category, title: pickI18n(l.category.title, 'en') } : null,
  }));
  return <LayersClientPage initialLayers={normalized} />;
}
