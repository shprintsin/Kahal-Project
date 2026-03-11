import { notFound } from "next/navigation";
import { LayerDetailClient } from "./LayerDetailClient";
import { getNavigation } from "@/app/lib/get-navigation";

export const revalidate = 60;

export default async function LayerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [{ getLayerBySlug }, navigation] = await Promise.all([
    import("@/app/admin/actions/layers"),
    getNavigation(),
  ]);
  const layer = await getLayerBySlug(slug);

  if (!layer) {
    notFound();
  }

  return <LayerDetailClient layer={layer} navigation={navigation} />;
}
