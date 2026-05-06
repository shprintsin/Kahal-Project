import { getPages } from "@/app/admin/actions/pages";
import { pickI18n } from "@/lib/i18n/fallback";
import { PagesClientPage } from "./pages-client-page";

export default async function PagesPage() {
  const pages = await getPages();
  const normalized = pages.map((p: any) => ({
    ...p,
    title: pickI18n(p.title, 'en'),
    parent: p.parent ? { ...p.parent, title: pickI18n(p.parent.title, 'en') } : null,
  }));

  return <PagesClientPage initialPages={normalized} />;
}
