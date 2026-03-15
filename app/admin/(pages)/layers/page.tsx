import { LayersClientPage } from "./layers-client-page";
import prisma from "@/lib/prisma";

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
          maps: true,
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
  return <LayersClientPage initialLayers={layers} />;
}
