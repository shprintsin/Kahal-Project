import { notFound } from "next/navigation";
import { getDataset, getDatasets } from "@/app/admin/actions/datasets";
import { getTags } from "@/app/admin/actions/tags";
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

  const [tags, datasets] = await Promise.all([
    getTags(),
    getDatasets(),
  ]);

  return (
    <DatasetEditorClient
      dataset={dataset}
      tags={tags}
      datasets={datasets}
      isNew={isNew}
    />
  );
}