
import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const ArtifactCategoryType: ContentTypeDefinition = {
  name: "Artifact Category",
  plural: "Artifact Categories",
  slug: "artifact-categories",
  icon: "Archive", 
  
  model: "ArtifactCategory",
  
  fields: [
    createField.text("title", "Title", { required: true, order: 1 }),
    createField.slug("slug", "title", "/artifact-category/"),
  ],
  
  sidebar: {
    group: "Taxonomy",
    order: 5,
  },
  
  actions: "auto",
};

registerContentType(ArtifactCategoryType);
