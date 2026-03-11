import { listMapsAPI } from "@/app/admin/actions/maps";
import { MapsListClient } from "./maps-list-client";

export default async function MapsPage() {
  const result = await listMapsAPI();
  return <MapsListClient initialMaps={result.maps || []} />;
}
