import { getContentBlocksData } from "@/lib/get-content-blocks-data";
import BlockLayoutClient from "./block-layout-client";

export const dynamic = "force-dynamic";

export default async function BlockLayoutsPage() {
  const data = await getContentBlocksData();
  return <BlockLayoutClient {...data} />;
}
