/**
 * Article Content Type
 * 
 * Example content type definition for blog articles/posts.
 * This serves as a template for creating new content types.
 */

import { FileText } from "lucide-react";
import { 
  ContentTypeDefinition, 
  createField,
  registerContentType,
} from "../content-type-registry";

export const ArticleType: ContentTypeDefinition = {
  // Identity
  name: "Article",
  plural: "Articles",
  slug: "articles",
  icon: "FileText",
  
  // Database
  model: "Post", // Maps to Prisma Post model
  
  // Fields
  fields: [
    createField.text("title", "Title", { 
      required: true, 
      showInList: true,
      order: 1,
    }),
    
    createField.slug("slug", "title", "/articles/"),
    
    createField.markdown("content", "Content", {
      placeholder: "Write your article content in Markdown...",
      rows: 20,
      order: 3,
    }),
    
    createField.text("excerpt", "Excerpt", {
      showInList: false,
      rows: 3,
      placeholder: "Brief description for previews",
      order: 2,
    }),
    
    createField.status("status", [
      { value: "draft", label: "Draft" },
      { value: "published", label: "Published" },
      { value: "archived", label: "Archived" },
    ]),
    
    createField.relation("category", "Category", "Category", {
      relationField: "title",
      allowCreate: true,
    }),
    
    createField.relationMany("tags", "Tags", "Tag", {
      relationField: "name",
      allowCreate: true,
    }),
    
    createField.thumbnail("thumbnail"),
    
    createField.relation("author", "Author", "User", {
      relationField: "name",
      readonly: true,
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
  
  // Use auto-generated CRUD
  actions: "auto",
};

// Register this content type
registerContentType(ArticleType);
