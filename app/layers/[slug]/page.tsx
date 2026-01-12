import { notFound } from "next/navigation";
import { LayerDetailClient } from "./LayerDetailClient";

export const revalidate = 60;

export default async function LayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { getLayerBySlug } = await import("@/app/admin/actions/layers");
  const layer = await getLayerBySlug(slug);

  if (!layer) {
    notFound();
  }

  return <LayerDetailClient layer={layer} />;
}
