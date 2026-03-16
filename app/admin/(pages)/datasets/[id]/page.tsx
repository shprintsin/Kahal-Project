import { notFound } from "next/navigation";
import { getDataset, getDatasets } from "@/app/admin/actions/datasets";
import { getTags } from "@/app/admin/actions/tags";
import { getCategories } from "@/app/admin/actions/categories";
import { getRegions } from "@/app/admin/actions/regions";
import { DatasetEditorClient } from "./dataset-editor-client";

export default async function DatasetEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let dataset = null;
  if (!isNew) {
    try {
      dataset = await getDataset(id);
    } catch (error) {
      notFound();
    }
  }

  const [tags, datasets, categories, regions] = await Promise.all([
    getTags(),
    getDatasets(),
    getCategories(),
    getRegions(),
  ]);

  return (
    <DatasetEditorClient
      dataset={dataset}
      tags={tags}
      datasets={datasets}
      categories={categories}
      regions={regions}
      isNew={isNew}
    />
  );
}