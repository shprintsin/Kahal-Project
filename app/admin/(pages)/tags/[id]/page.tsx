import { getContentType, ContentTypeEditorPage, getActionsForContentType } from "@/app/admin/system";
import { notFound } from "next/navigation";

export default async function TagEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const contentType = getContentType("tags");
  
  if (!contentType) {
    return <div>Content type not found</div>;
  }
  
  const actions = getActionsForContentType(contentType);
  
  // Handle "new" route
  if (id === "new") {
    return (
      <ContentTypeEditorPage
        contentType={contentType}
        entity={null}
        actions={actions}
      />
    );
  }
  
  // Load existing entity
  const entity = await actions.get(id);
  
  if (!entity) {
    notFound();
  }
  
  return (
    <ContentTypeEditorPage
      contentType={contentType}
      entity={entity}
      actions={actions}
    />
  );
}
