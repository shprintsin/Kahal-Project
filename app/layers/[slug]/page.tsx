import { notFound } from "next/navigation";
import { LayerDetailClient } from "./LayerDetailClient";
import { getSiteShellData } from "@/app/lib/get-navigation";

export const revalidate = 60;

export default async function LayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ getLayerBySlug }, shellData] = await Promise.all([
    import("@/app/admin/actions/layers"),
    getSiteShellData(),
  ]);
  const layer = await getLayerBySlug(slug);

  if (!layer) {
    notFound();
  }

  return <LayerDetailClient layer={layer} shellData={shellData} />;
}
