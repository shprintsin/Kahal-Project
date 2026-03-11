import { LayerEditorV2 } from "@/app/admin/editors/layer-editor-v2";
import { listLayersAPI } from "@/app/admin/actions/layers";

export default async function NewLayerPage() {
  const layersResult = await listLayersAPI();
  return <LayerEditorV2 mode="create" allLayers={layersResult.layers || []} />;
}
