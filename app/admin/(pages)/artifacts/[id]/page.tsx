import { notFound } from "next/navigation";
import { getArtifact, getArtifacts } from "@/app/admin/actions/artifacts";
import { getArtifactCategories } from "@/app/admin/actions/artifact-categories";
import { getPeriods } from "@/app/admin/actions/periods";
import { getTags } from "@/app/admin/actions/tags";
import { ArtifactEditorClient } from "./artifact-editor-client";

export default async function ArtifactEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let artifact = null;
  if (!isNew) {
    try {
      artifact = await getArtifact(id);
    } catch (error) {
      notFound();
    }
  }

  const [categories, periods, tags, artifacts] = await Promise.all([
    getArtifactCategories(),
    getPeriods(),
    getTags(),
    getArtifacts(),
  ]);

  return (
    <ArtifactEditorClient
      artifact={artifact}
      categories={categories}
      periods={periods}
      tags={tags}
      artifacts={artifacts}
      isNew={isNew}
    />
  );
}