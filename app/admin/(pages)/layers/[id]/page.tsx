import { notFound } from "next/navigation";
import { LayerEditorV2 } from "@/app/admin/editors/layer-editor-v2";
import { getLayer } from "@/app/admin/actions/layers";
import { getCategories } from "@/app/admin/actions/categories";

export default async function EditLayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [layer, categories] = await Promise.all([
    getLayer(id, { includeMaps: true }),
    getCategories(),
  ]);

  if (!layer) {
    notFound();
  }

  return <LayerEditorV2 layer={layer} mode="edit" categories={categories} />;
}
