import { notFound } from "next/navigation";
import { getDocument, getDocuments } from "@/app/admin/actions/documents";
import { DocumentEditorClient } from "./document-editor-client";


export default async function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let document = null;
  if (!isNew) {
    try {
      const result = await getDocument(id);
      if (result.success && result.data) {
        document = result.data;
      }
    } catch (error) {
      notFound();
    }
  }

  const documentsResult = await getDocuments();
  const documents = documentsResult.success && documentsResult.data ? documentsResult.data.documents : [];

  return (
    <DocumentEditorClient
      document={document}
      documents={documents}
      isNew={isNew}
    />
  );
}
