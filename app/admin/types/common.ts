import { UseFormReturn, FieldValues } from "react-hook-form";
import { z } from "zod";

/**
 * Common types for all editors and dialogs
 */

// Base editor props - extend this for specific editors
export interface BaseEditorProps<T = any> {
  entity: T | null;
  mode?: "create" | "edit";
}

// Actions for CRUD operations
export interface EntityActions<TData = any, TEntity = any> {
  create: (data: TData) => Promise<TEntity>;
  update: (id: string, data: TData) => Promise<TEntity>;
  delete: (id: string) => Promise<void>;
}

// Configuration for useEntityEditor hook
export interface EntityEditorConfig {
  entityName: string;           // Display name (e.g., "Post", "Category")
  redirectPath?: string;        // Where to redirect after create/delete
  generateSlug?: boolean;       // Auto-generate slug from title
  slugSource?: string;          // Field path to generate slug from (e.g., "title" or "nameI18n.en")
  onSuccess?: {
    create?: string;            // Custom success message for create
    update?: string;            // Custom success message for update
    delete?: string;            // Custom success message for delete
  };
}

// Return type from useEntityEditor hook
export interface EntityEditor<TFormValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFormValues>;
  loading: boolean;
  deleting: boolean;
  isNew: boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleDelete: () => Promise<void>;
}

// Section configuration for EntityEditor component
export interface EditorSection {
  title?: string;
  description?: string;
  fields: any[];  // FieldConfig[]
  columns?: 1 | 2;
}

// Props for EntityEditor component
export interface EntityEditorProps {
  title: string;
  editor: EntityEditor;
  sections: EditorSection[];
  sidebar?: React.ReactNode;
  maxWidth?: "xl" | "2xl" | "3xl" | "4xl" | "full";
  showStatus?: boolean;
  status?: string;
  language?: string;
  entityName?: string;
}

// Props for EntityEditorDialog component
export interface EntityEditorDialogProps {
  title: string;
  editor: EntityEditor;
  sections: EditorSection[];
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}
