import { getMaps } from "@/app/admin/actions/maps";
import { Maps2ListClient } from "./maps2-list-client";

export default async function Maps2Page() {
  const maps = await getMaps();
  return <Maps2ListClient initialMaps={maps} />;
}
