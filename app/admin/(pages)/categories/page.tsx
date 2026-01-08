import { getContentType, ContentTypeListPage, getActionsForContentType } from "@/app/admin/system";

export default async function CategoriesListPage() {
  const contentType = getContentType("categories");
  
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
