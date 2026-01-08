import { notFound } from "next/navigation";
import { LayerEditorV2 } from "@/app/admin/editors/layer-editor-v2";
import { getLayer } from "@/app/admin/actions/layers";

export default async function EditLayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const layer = await getLayer(id, { includeMaps: true });

  if (!layer) {
    notFound();
  }

  return <LayerEditorV2 layer={layer} mode="edit" />;
}
