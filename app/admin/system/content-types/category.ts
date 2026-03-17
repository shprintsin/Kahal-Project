/**
 * Category Content Type
 * 
 * Taxonomy for grouping content.
 */

import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const CategoryType: ContentTypeDefinition = {
  name: "Category",
  plural: "Categories",
  slug: "categories",
  icon: "Folder", // String icon
  
  model: "Category",
  
  fields: [
    createField.text("title", "Title", { required: true, order: 1 }),
    createField.translatable("titleI18n", "Title (i18n)"),
    createField.slug("slug", "title", "/category/"),
    createField.translatable("descriptionI18n", "Description (i18n)"),
    createField.text("description", "Description", {
      rows: 3,
      showInList: true,
      order: 2,
    }),
    createField.date("createdAt", "Created"),
  ],
  
  sidebar: {
    group: "Taxonomy",
    order: 1,
  },
  
  actions: "auto",
};

registerContentType(CategoryType);
