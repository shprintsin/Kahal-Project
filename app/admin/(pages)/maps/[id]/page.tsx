import { notFound } from "next/navigation";
import { getMap } from "@/app/admin/actions/maps";
import { getCategories } from "@/app/admin/actions/categories";
import { getTags } from "@/app/admin/actions/tags";
import { getRegions } from "@/app/admin/actions/regions";
import { LoopMapEditor } from "@/app/admin/editors/loop-map-editor";

interface MapPageProps {
  params: Promise<{ id: string }>;
}

export default async function MapPage({ params }: MapPageProps) {
  const { id } = await params;

  let map = null;

  try {
    if (id !== "new") {
      map = await getMap(id);
    }
  } catch (error) {
    if (id !== "new") {
      notFound();
    }
  }

  const [categories, tags, regions] = await Promise.all([
    getCategories(),
    getTags(),
    getRegions(),
  ]);

  return (
    <LoopMapEditor
      map={map}
      categories={categories}
      tags={tags}
      regions={regions}
    />
  );
}
