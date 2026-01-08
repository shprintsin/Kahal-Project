import { getDocuments } from "@/app/admin/actions/documents";
import { DocumentEditorClient } from "../[id]/document-editor-client";

export default async function NewDocumentPage() {
  const documentsResult = await getDocuments();
  const documents = documentsResult.success && documentsResult.data ? documentsResult.data.documents : [];

  return (
    <DocumentEditorClient
      document={null}
      documents={documents}
      isNew={true}
    />
  );
}
