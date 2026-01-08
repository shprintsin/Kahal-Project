import { getPages } from "@/app/admin/actions/pages";
import { PagesClientPage } from "./pages-client-page";

export default async function PagesPage() {
  const pages = await getPages();
  
  return <PagesClientPage initialPages={pages} />;
}
