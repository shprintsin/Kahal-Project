import { notFound } from "next/navigation";
import { getPage, getPages } from "@/app/admin/actions/pages";
import { getTags } from "@/app/admin/actions/tags";
import { getRegions } from "@/app/admin/actions/regions";
import { pickI18n } from "@/lib/i18n/fallback";
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

  const [tags, pages, regions] = await Promise.all([
    getTags(),
    getPages(),
    getRegions(),
  ]);

  return (
    <PageEditorClient
      page={page}
      tags={tags}
      pages={pages}
      regions={regions.map((r: any) => ({ id: r.id, slug: r.slug, name: pickI18n(r.name, 'en') }))}
      isNew={isNew}
    />
  );
}
