import { notFound } from "next/navigation";
import { LayerEditorV2 } from "@/app/admin/editors/layer-editor-v2";
import { getLayer, listLayersAPI } from "@/app/admin/actions/layers";

export default async function EditLayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [layer, layersResult] = await Promise.all([
    getLayer(id, { includeMaps: true }),
    listLayersAPI(),
  ]);

  if (!layer) {
    notFound();
  }

  return <LayerEditorV2 layer={layer} mode="edit" allLayers={layersResult.layers || []} />;
}
