"use client";

/**
 * DynamicEditor
 * 
 * A field-driven editor component that automatically generates the form
 * layout from ContentTypeDefinition fields. Integrates with useEntityEditor
 * for CRUD operations.
 */

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ContentTypeDefinition, FieldDefinition } from "./content-type-registry";
import { generateSchema } from "./content-type-registry";
import { getEditorComponent } from "./field-type-registry";

// ============================================
// Types
// ============================================

interface DynamicEditorProps<T = any> {
  contentType: ContentTypeDefinition;
  entity?: T | null;
  
  // CRUD handlers
  onSave?: (data: any) => Promise<any>;
  onDelete?: () => Promise<void>;
  
  // State
  saving?: boolean;
  deleting?: boolean;
  
  // Callbacks
  onDirtyChange?: (isDirty: boolean) => void;
  
  className?: string;
}

// ============================================
// Component
// ============================================

export function DynamicEditor<T extends { id?: string }>({
  contentType,
  entity,
  onSave,
  onDelete,
  saving = false,
  deleting = false,
  onDirtyChange,
  className,
}: DynamicEditorProps<T>) {
  const isNew = !entity?.id;
  
  // Generate Zod schema from field definitions
  const schema = React.useMemo(() => generateSchema(contentType.fields), [contentType.fields]);
  
  // Build default values from entity or empty
  const defaultValues = React.useMemo(() => {
    const values: Record<string, any> = {};
    for (const field of contentType.fields) {
      if (entity && field.key in entity) {
        values[field.key] = (entity as any)[field.key];
      } else {
        // Set default by type
        switch (field.type) {
          case "boolean":
            values[field.key] = false;
            break;
          case "relation-many":
            values[field.key] = [];
            break;
          default:
            values[field.key] = "";
        }
      }
    }
    return values;
  }, [contentType.fields, entity]);
  
  // Initialize form
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  // Track dirty state
  React.useEffect(() => {
    const subscription = form.watch(() => {
      onDirtyChange?.(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);
  
  // Get fields by zone
  const mainFields = contentType.fields.filter(
    f => f.showInEditor !== false && (f.zone === "main" || !f.zone)
  );
  const sidebarFields = contentType.fields.filter(
    f => f.showInEditor !== false && f.zone === "sidebar"
  );
  
  // Handle form submission
  const handleSubmit = async (data: any) => {
    if (!onSave) return;
    
    try {
      await onSave(data);
      toast.success(`${contentType.name} ${isNew ? "created" : "updated"} successfully`);
    } catch (error: any) {
      toast.error(error.message || `Failed to save ${contentType.name.toLowerCase()}`);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete this ${contentType.name.toLowerCase()}? This cannot be undone.`
    );
    if (!confirmed) return;
    
    try {
      await onDelete();
      toast.success(`${contentType.name} deleted`);
    } catch (error: any) {
      toast.error(error.message || `Failed to delete ${contentType.name.toLowerCase()}`);
    }
  };
  
  // Render a single field
  const renderField = (field: FieldDefinition) => {
    if (field.readonly && !entity) return null;
    
    const EditorComponent = getEditorComponent(field);
    const value = form.watch(field.key);
    const error = form.formState.errors[field.key]?.message as string | undefined;
    
    return (
      <div key={field.key} className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
        <EditorComponent
          value={value}
          field={field}
          onChange={(v) => form.setValue(field.key, v, { shouldDirty: true })}
          error={error}
          disabled={field.readonly}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={cn("space-y-6", className)}>
        {/* Two-column layout: Main + Sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Main content */}
          <div className="space-y-6">
            {mainFields.map(renderField)}
          </div>
          
          {/* Sidebar */}
          {sidebarFields.length > 0 && (
            <div className="space-y-6">
              {/* Action card */}
              <div className="p-4 rounded-lg border bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Actions</h3>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button type="submit" disabled={saving || !form.formState.isDirty}>
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isNew ? "Create" : "Save"}
                  </Button>
                  
                  {!isNew && onDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Sidebar fields */}
              {sidebarFields.map(renderField)}
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}

/**
 * Hook to get form data object suitable for API calls
 * Use this when you need to manually handle the save
 */
export function useDynamicForm(contentType: ContentTypeDefinition, entity?: any) {
  const schema = React.useMemo(() => generateSchema(contentType.fields), [contentType.fields]);
  
  const defaultValues = React.useMemo(() => {
    const values: Record<string, any> = {};
    for (const field of contentType.fields) {
      if (entity && field.key in entity) {
        values[field.key] = entity[field.key];
      }
    }
    return values;
  }, [contentType.fields, entity]);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });
  
  const getFormData = () => form.getValues();
  
  return {
    form,
    getFormData,
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
  };
}
