/**
 * Page Content Type
 * 
 * Content type definition for static pages.
 * Migrated from the existing Page model.
 */


import { 
  ContentTypeDefinition, 
  createField,
  registerContentType,
} from "../content-type-registry";

export const PageType: ContentTypeDefinition = {
  // Identity
  name: "Page",
  plural: "Pages",
  slug: "pages",
  icon: "File",
  
  // Database
  model: "Page",
  
  // Fields
  fields: [
    createField.text("title", "Title", { 
      required: true, 
      showInList: true,
      order: 1,
    }),
    
    createField.slug("slug", "title", "/pages/"),
    
    createField.text("excerpt", "Excerpt", {
      showInList: false,
      rows: 3,
      placeholder: "Brief description for previews",
      zone: "main",
      order: 2,
    }),
    
    createField.markdown("content", "Content", {
      placeholder: "Write your page content in Markdown...",
      rows: 20,
      order: 3,
    }),
    
    createField.status("status", [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ]),
    
    {
      key: "language",
      type: "select",
      label: "Language",
      options: [
        { value: "HE", label: "Hebrew" },
        { value: "EN", label: "English" },
      ],
      showInList: true,
      showInEditor: true,
      editable: true,
      zone: "sidebar",
      listDisplay: "badge",
    },
    
    {
      key: "parent_id",
      type: "relation",
      label: "Parent Page",
      relation: "Page",
      relationField: "title",
      showInList: false,
      showInEditor: true,
      zone: "sidebar",
    },
    
    createField.boolean("show_in_menu", "Show in Menu", {
      showInList: true,
    }),
    
    {
      key: "menu_order",
      type: "number",
      label: "Menu Order",
      showInList: true,
      showInEditor: true,
      editable: true,
      zone: "sidebar",
    },
    
    createField.date("createdAt", "Created"),
    createField.date("updatedAt", "Updated"),
  ],
  
  // Navigation
  sidebar: {
    group: "Content",
    order: 2,
  },
  
  // Features
  features: {
    search: true,
    filter: true,
    bulkActions: true,
    translations: true,
  },
  
  // Editor style
  editor: "loop",
  
  // List display
  listDisplay: "table",
  defaultSort: { field: "menu_order", order: "asc" },
  
  // Auto-generated CRUD
  actions: "auto",
};

// Register
registerContentType(PageType);
