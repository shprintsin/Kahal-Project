import { getDatasets } from "@/app/admin/actions/datasets";
import { Maps2ListClient, type MapItem } from "./maps2-list-client";

export default async function Maps2Page() {
  const maps = await getDatasets();
  return <Maps2ListClient initialMaps={maps as unknown as MapItem[]} />;
}
