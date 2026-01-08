/**
 * Post Content Type
 * 
 * Content type definition for blog posts.
 * Migrated from the existing Post model.
 */

import { FileText } from "lucide-react";
import { 
  ContentTypeDefinition, 
  createField,
  registerContentType,
} from "../content-type-registry";

export const PostType: ContentTypeDefinition = {
  // Identity
  name: "Post",
  plural: "Posts",
  slug: "posts",
  icon: "FileText",
  
  // Database
  model: "Post",
  
  // Fields
  fields: [
    createField.text("title", "Title", { 
      required: true, 
      showInList: true,
      order: 1,
    }),
    
    createField.slug("slug", "title", "/posts/"),
    
    createField.text("excerpt", "Excerpt", {
      showInList: false,
      rows: 3,
      placeholder: "Brief description for previews",
      zone: "main",
      order: 2,
    }),
    
    createField.markdown("content", "Content", {
      placeholder: "Write your post content in Markdown...",
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
    
    createField.relation("category_id", "Category", "Category", {
      relationField: "title",
      allowCreate: true,
    }),
    
    createField.relationMany("tags", "Tags", "Tag", {
      relationField: "name",
      allowCreate: true,
    }),
    
    createField.thumbnail("thumbnail_id"),
    
    createField.relation("author_id", "Author", "User", {
      relationField: "name",
      readonly: true,
      showInList: true,
    }),
    
    createField.date("createdAt", "Created"),
    createField.date("updatedAt", "Updated"),
  ],
  
  // Navigation
  sidebar: {
    group: "Content",
    order: 1,
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
  defaultSort: { field: "createdAt", order: "desc" },
  
  // Auto-generated CRUD
  actions: "auto",
};

// Register
registerContentType(PostType);
