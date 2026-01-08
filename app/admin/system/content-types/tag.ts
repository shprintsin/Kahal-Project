/**
 * Tag Content Type
 * 
 * Taxonomy for tagging content.
 */

import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const TagType: ContentTypeDefinition = {
  name: "Tag",
  plural: "Tags",
  slug: "tags",
  icon: "Tag", // String icon
  
  model: "Tag",
  
  fields: [
    createField.text("name", "Name", { required: true, order: 1 }),
    createField.slug("slug", "name", "/tag/"),
    createField.date("createdAt", "Created"),
  ],
  
  sidebar: {
    group: "Taxonomy",
    order: 2,
  },
  
  actions: "auto",
};

registerContentType(TagType);
