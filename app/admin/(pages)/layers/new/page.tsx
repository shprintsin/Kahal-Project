import { LayerEditorV2 } from "@/app/admin/editors/layer-editor-v2";
import { getCategories } from "@/app/admin/actions/categories";

export default async function NewLayerPage() {
  const categories = await getCategories();
  return <LayerEditorV2 mode="create" categories={categories} />;
}
