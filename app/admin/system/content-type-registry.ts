/**
 * Content Type Registry
 * 
 * Central registry for all configurable content types.
 * Each content type defines its fields, display, and behavior.
 */

import { LucideIcon } from "lucide-react";
import { z } from "zod";

// ============================================
// Field Type Definitions
// ============================================

export type FieldType =
  | "text"
  | "textarea"
  | "markdown"
  | "slug"
  | "number"
  | "date"
  | "datetime"
  | "boolean"
  | "status"
  | "select"
  | "relation"
  | "relation-many"
  | "thumbnail"
  | "file"
  | "files"
  | "color"
  | "url"
  | "email"
  | "translatable"
  | "json";

export type DisplayType = 
  | "text" 
  | "badge" 
  | "badge-list" 
  | "status-dot"
  | "avatar"
  | "image"
  | "date"
  | "boolean"
  | "truncate"
  | "link"
  | "custom";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface FieldDefinition {
  // Core
  key: string;
  type: FieldType;
  label: string;
  
  // Display
  showInList?: boolean;      // Show in table view
  showInEditor?: boolean;    // Show in editor view
  listDisplay?: DisplayType; // How to display in table
  width?: string;            // Table column width
  
  // Behavior
  editable?: boolean;        // Can be edited in fast-edit mode
  required?: boolean;        // Is required for save
  readonly?: boolean;        // Cannot be changed
  
  // For slug fields
  sourceField?: string;      // Generate from this field
  prefix?: string;           // URL prefix like /posts/
  
  // For select/status fields
  options?: SelectOption[];
  
  // For relation fields
  relation?: string;         // Related content type name
  relationField?: string;    // Field to display from relation
  allowCreate?: boolean;     // Allow creating new related items
  
  // For text fields
  placeholder?: string;
  rows?: number;             // For textarea
  
  // Validation
  validation?: z.ZodType<any>;
  
  // Editor placement
  zone?: "main" | "sidebar"; // Where to show in editor
  order?: number;            // Order in zone

  // Display direction
  dir?: "rtl" | "ltr";
}

// ============================================
// Content Type Definition
// ============================================

export interface ContentTypeDefinition {
  // Identity
  name: string;              // Singular: "Post"
  plural: string;            // Plural: "Posts"
  slug: string;              // URL slug: "posts"
  icon: any;                 // Icon (component or string)
  
  // Database
  model: string;             // Prisma model name: "Post"
  
  // Schema
  fields: FieldDefinition[];
  
  // Navigation
  sidebar: {
    group: string;           // Sidebar group: "Content"
    order: number;           // Order within group
  };
  
  // Behavior
  features?: {
    search?: boolean;        // Enable search
    filter?: boolean;        // Enable filters
    bulkActions?: boolean;   // Enable bulk operations
    softDelete?: boolean;    // Use soft delete
    versions?: boolean;      // Track versions
    translations?: boolean;  // Multi-language support
  };
  
  // Editor
  editor?: "loop" | "classic" | "dialog";
  
  // List view
  listDisplay?: "table" | "cards" | "tree";
  defaultSort?: { field: string; order: "asc" | "desc" };
  
  // CRUD actions - "auto" generates from Prisma, or provide custom
  actions?: "auto" | {
    list?: (options: any) => Promise<any>;
    get?: (id: string) => Promise<any>;
    create?: (data: any) => Promise<any>;
    update?: (id: string, data: any) => Promise<any>;
    delete?: (id: string) => Promise<void>;
  };
}

// ============================================
// Content Type Registry
// ============================================

const registry = new Map<string, ContentTypeDefinition>();

export function registerContentType(type: ContentTypeDefinition): void {
  registry.set(type.slug, type);
}

export function getContentType(slug: string): ContentTypeDefinition | undefined {
  return registry.get(slug);
}

export function getAllContentTypes(): ContentTypeDefinition[] {
  return Array.from(registry.values());
}

export function getContentTypesByGroup(): Record<string, ContentTypeDefinition[]> {
  const types = getAllContentTypes();
  return types.reduce((acc, type) => {
    const group = type.sidebar.group;
    if (!acc[group]) acc[group] = [];
    acc[group].push(type);
    acc[group].sort((a, b) => a.sidebar.order - b.sidebar.order);
    return acc;
  }, {} as Record<string, ContentTypeDefinition[]>);
}

// ============================================
// Helper: Create Field Definitions
// ============================================

export const createField = {
  text: (key: string, label: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "text",
    label,
    showInList: true,
    showInEditor: true,
    editable: true,
    zone: "main",
    ...options,
  }),
  
  slug: (key: string, sourceField: string, prefix = "/"): FieldDefinition => ({
    key,
    type: "slug",
    label: "Slug",
    sourceField,
    prefix,
    showInList: true,
    showInEditor: true,
    editable: true,
    zone: "main",
    listDisplay: "text",
    dir: "ltr",
  }),
  
  markdown: (key: string, label: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "markdown",
    label,
    showInList: false,
    showInEditor: true,
    zone: "main",
    rows: 20,
    ...options,
  }),
  
  status: (key: string, options: SelectOption[] = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
  ]): FieldDefinition => ({
    key,
    type: "status",
    label: "Status",
    options,
    showInList: true,
    showInEditor: true,
    editable: true,
    zone: "sidebar",
    listDisplay: "status-dot",
  }),
  
  relation: (key: string, label: string, relation: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "relation",
    label,
    relation,
    showInList: true,
    showInEditor: true,
    zone: "sidebar",
    listDisplay: "badge",
    allowCreate: true,
    ...options,
  }),
  
  relationMany: (key: string, label: string, relation: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "relation-many",
    label,
    relation,
    showInList: true,
    showInEditor: true,
    zone: "sidebar",
    listDisplay: "badge-list",
    allowCreate: true,
    ...options,
  }),
  
  number: (key: string, label: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "number",
    label,
    showInList: true,
    showInEditor: true,
    editable: true,
    zone: "main",
    ...options,
  }),
  
  thumbnail: (key: string = "thumbnail"): FieldDefinition => ({
    key,
    type: "thumbnail",
    label: "Thumbnail",
    showInList: true,
    showInEditor: true,
    zone: "sidebar",
    listDisplay: "image",
  }),
  
  date: (key: string, label: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "date",
    label,
    showInList: true,
    showInEditor: false,
    readonly: true,
    listDisplay: "date",
    ...options,
  }),
  
  boolean: (key: string, label: string, options: Partial<FieldDefinition> = {}): FieldDefinition => ({
    key,
    type: "boolean",
    label,
    showInList: true,
    showInEditor: true,
    editable: true,
    zone: "sidebar",
    listDisplay: "boolean",
    ...options,
  }),
};

// ============================================
// Helper: Generate Zod Schema from Fields
// ============================================

export function generateSchema(fields: FieldDefinition[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodType<any>> = {};
  
  for (const field of fields) {
    let fieldSchema: z.ZodType<any>;
    
    switch (field.type) {
      case "text":
      case "slug":
      case "textarea":
      case "markdown":
      case "url":
      case "email":
        fieldSchema = z.string();
        break;
      case "number":
        fieldSchema = z.number();
        break;
      case "boolean":
        fieldSchema = z.boolean();
        break;
      case "date":
      case "datetime":
        fieldSchema = z.date().or(z.string());
        break;
      case "select":
      case "status":
        fieldSchema = z.string();
        break;
      case "relation":
        fieldSchema = z.string().nullable();
        break;
      case "relation-many":
        fieldSchema = z.array(z.string());
        break;
      case "json":
        fieldSchema = z.any();
        break;
      default:
        fieldSchema = z.any();
    }
    
    // Apply validation override if provided
    if (field.validation) {
      fieldSchema = field.validation;
    }
    
    // Make optional if not required
    if (!field.required) {
      fieldSchema = fieldSchema.optional();
    }
    
    shape[field.key] = fieldSchema;
  }
  
  return z.object(shape);
}
