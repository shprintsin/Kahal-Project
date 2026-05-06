import { getDatasets } from "@/app/admin/actions/datasets";
import { pickI18n } from "@/lib/i18n/fallback";
import { DatasetsClientPage } from "./datasets-client-page";

export default async function DatasetsPage() {
  const datasets = await getDatasets();
  const normalized = datasets.map((d: any) => ({
    ...d,
    title: pickI18n(d.title, 'en'),
    description: typeof d.description === 'string' ? d.description : pickI18n(d.description, 'en', '') || null,
  }));

  return <DatasetsClientPage initialDatasets={normalized} />;
}

