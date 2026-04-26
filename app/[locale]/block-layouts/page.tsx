import { getContentBlocksData } from "@/lib/get-content-blocks-data";
import type { Locale } from "@/lib/i18n/config";
import BlockLayoutClient from "./block-layout-client";

export const dynamic = "force-dynamic";

export default async function BlockLayoutsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getContentBlocksData(locale as Locale);
  return <BlockLayoutClient {...data} />;
}
