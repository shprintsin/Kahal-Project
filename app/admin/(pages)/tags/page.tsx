import { getContentType, ContentTypeListPage, getActionsForContentType } from "@/app/admin/system";

export default async function TagsListPage() {
  const contentType = getContentType("tags");
  
  if (!contentType) {
    return <div>Content type not found</div>;
  }
  
  const actions = getActionsForContentType(contentType);
  const initialData = await actions.list({ limit: 20 });
  
  return (
    <ContentTypeListPage
      contentType={contentType}
      initialData={initialData}
      actions={actions}
    />
  );
}
