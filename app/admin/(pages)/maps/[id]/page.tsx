import { notFound } from "next/navigation";
import { getMap } from "@/app/admin/actions/maps";
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

  return <LoopMapEditor map={map} />;
}
