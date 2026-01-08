import { getDatasets } from "@/app/admin/actions/datasets";
import { DatasetsClientPage } from "./datasets-client-page";

export default async function DatasetsPage() {
  const datasets = await getDatasets();
  
  return <DatasetsClientPage initialDatasets={datasets} />;
}

