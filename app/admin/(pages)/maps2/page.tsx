import { getDatasets } from "@/app/admin/actions/datasets";
import { Maps2ListClient, type MapItemInput } from "./maps2-list-client";

export default async function Maps2Page() {
  const maps = await getDatasets();
  const initialMaps = maps.map((m): MapItemInput => ({
    id: m.id,
    slug: m.slug,
    title: (m.title as Record<string, string> | null) ?? null,
    year: m.year ?? null,
    version: m.version ?? null,
    status: m.status,
    createdAt: m.createdAt,
  }));
  return <Maps2ListClient initialMaps={initialMaps} />;
}
