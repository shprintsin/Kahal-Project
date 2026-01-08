import { notFound } from "next/navigation";
import { LayerDetailClient } from "./LayerDetailClient";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default async function LayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { getLayer } = await import("@/lib/api");
  const layer = await getLayer(slug);

  if (!layer) {
    notFound();
  }

  return <LayerDetailClient layer={layer} />;
}
