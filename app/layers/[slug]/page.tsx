import { notFound } from "next/navigation";
import { LayerDetailClient } from "./LayerDetailClient";
import { getLayerBySlug } from "@/app/admin/actions/layers";

export const revalidate = 60;

export default async function LayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const layer = await getLayerBySlug(slug);

  if (!layer) {
    notFound();
  }

  return <LayerDetailClient layer={layer} />;
}
