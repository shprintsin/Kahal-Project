import { getDocuments } from "@/app/admin/actions/documents";
import { DocumentsClientPage } from "./documents-client-page";

export default async function DocumentsPage() {
  const result = await getDocuments(1, 1000); // Get all documents for client-side filtering
  const documents = result.success && result.data ? result.data.documents : [];
  
  return <DocumentsClientPage initialDocuments={documents} />;
}
