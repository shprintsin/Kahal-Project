import { notFound } from "next/navigation";
import { getPage, getPages } from "@/app/admin/actions/pages";
import { getTags } from "@/app/admin/actions/tags";
import { PageEditorClient } from "./page-editor-client";

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let page = null;
  if (!isNew) {
    try {
      page = await getPage(id);
    } catch (error) {
      notFound();
    }
  }

  // Load tags and pages for sidebar
  const [tags, pages] = await Promise.all([
    getTags(),
    getPages(),
  ]);

  return (
    <PageEditorClient
      page={page}
      tags={tags}
      pages={pages}
      isNew={isNew}
    />
  );
}
