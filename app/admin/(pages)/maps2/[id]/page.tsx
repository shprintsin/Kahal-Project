import { notFound } from "next/navigation";
import { getMapWithLayers } from "@/app/admin/actions/map-layers";
import { MapStudio } from "./map-studio";
import prisma from "@/lib/prisma";

interface MapEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function MapEditorPage({ params }: MapEditorPageProps) {
  const { id } = await params;

  const isNew = id === "new";

  let mapData = null;
  let layerLibrary: { id: string; name: string; slug: string; type: string; featureCount: number }[] = [];

  if (!isNew) {
    try {
      mapData = await getMapWithLayers(id);
      if (!mapData) notFound();
    } catch {
      notFound();
    }
  }

  const [allLayers, allCategories, allTags, allRegions] = await Promise.all([
    prisma.layer.findMany({
      select: { id: true, name: true, slug: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" },
    }),
    prisma.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.region.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  layerLibrary = allLayers.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    type: l.type,
    featureCount: 0,
  }));

  const categories = allCategories.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  const tagsData = allTags.map((t) => ({ id: t.id, name: t.name }));
  const regionsData = allRegions.map((r) => ({ id: r.id, name: r.name }));

  return (
    <MapStudio
      mapData={mapData}
      layerLibrary={layerLibrary}
      isNew={isNew}
      categories={categories}
      tags={tagsData}
      regions={regionsData}
    />
  );
}
