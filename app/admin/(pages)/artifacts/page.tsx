import { getArtifacts } from "@/app/admin/actions/artifacts";
import { ArtifactsClientPage } from "./artifacts-client-page";

export default async function ArtifactsPage() {
  const artifacts = await getArtifacts();
  
  return <ArtifactsClientPage initialArtifacts={artifacts} />;
}
