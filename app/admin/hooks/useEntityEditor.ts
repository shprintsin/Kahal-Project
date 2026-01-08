"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  EntityActions,
  EntityEditorConfig,
  EntityEditor as EntityEditorType,
} from "@/app/admin/types/common";
import { generateSlug as genSlug } from "@/app/admin/utils/slug";

/**
 * Unified hook for managing entity CRUD operations
 * Eliminates duplicate form state, handlers, and loading states across all editors
 * 
 * @example
 * const editor = useEntityEditor({
 *   entity: post,
 *   schema: postSchema,
 *   actions: { create: createPost, update: updatePost, delete: deletePost },
 *   config: {
 *     entityName: 'Post',
 *     redirectPath: '/admin/posts',
 *     generateSlug: true,
 *   }
 * });
 */
export function useEntityEditor<
  TSchema extends z.ZodType<any, any>,
  TFormValues extends FieldValues = z.infer<TSchema>,
  TEntity = any
>({
  entity,
  schema,
  actions,
  config,
  defaultValues,
}: {
  entity: TEntity | null;
  schema: TSchema;
  actions: EntityActions<TFormValues, TEntity>;
  config: EntityEditorConfig;
  defaultValues?: Partial<TFormValues>;
}): EntityEditorType<TFormValues> {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isNew = !entity;

  // Initialize form with react-hook-form + Zod validation
  const form = useForm<TFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: defaultValues as any,
  });

  /**
   * Auto-generate slug from specified field
   */
  useEffect(() => {
    if (!config.generateSlug || !config.slugSource || entity) return;

    const subscription = form.watch((value, { name }) => {
      if (name === config.slugSource) {
        const sourceField = config.slugSource!;
        const watchValue = value[sourceField as keyof typeof value];
        
        // For nested fields like "nameI18n.en", we need to access nested value
        const fieldValue = sourceField.includes(".")
          ? sourceField.split(".").reduce((obj, key) => obj?.[key], watchValue as any)
          : watchValue;
        
        if (fieldValue && typeof fieldValue === "string") {
          const slug = genSlug(fieldValue);
          form.setValue("slug" as any, slug as any, { shouldValidate: false });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [config.generateSlug, config.slugSource, entity, form]);

  /**
   * Handle form submission (create or update)
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setLoading(true);

    try {
      const data = form.getValues();
      const preparedData: any = {
        ...data,
      };

      // Normalize slug to match schema regex before validation
      if (typeof (preparedData as any).slug === "string") {
        preparedData.slug = genSlug((preparedData as any).slug);
      }

      const validated = schema.parse(preparedData);

      if (entity && typeof entity === "object" && "id" in entity) {
        // Update existing entity
        await actions.update((entity as any).id, validated);
        
        const successMessage =
          config.onSuccess?.update || `${config.entityName} updated successfully!`;
        toast.success(successMessage);
        
        router.refresh();
      } else {
        // Create new entity
        await actions.create(validated);
        
        const successMessage =
          config.onSuccess?.create || `${config.entityName} created successfully!`;
        toast.success(successMessage);
        
        if (config.redirectPath) {
          router.push(config.redirectPath);
        } else {
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error(`${config.entityName} save error:`, error);
      
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        toast.error("Please check the form for errors");
        return;
      }
      
      toast.error(error.message || `Failed to save ${config.entityName.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle entity deletion
   */
  const handleDelete = async () => {
    if (!entity || typeof entity !== "object" || !("id" in entity)) {
      toast.error(`No ${config.entityName.toLowerCase()} to delete`);
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to delete this ${config.entityName.toLowerCase()}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await actions.delete((entity as any).id);
      
      const successMessage =
        config.onSuccess?.delete || `${config.entityName} deleted successfully`;
      toast.success(successMessage);
      
      if (config.redirectPath) {
        router.push(config.redirectPath);
      } else {
        router.refresh();
      }
    } catch (error: any) {
      console.error(`${config.entityName} delete error:`, error);
      toast.error(error.message || `Failed to delete ${config.entityName.toLowerCase()}`);
    } finally {
      setDeleting(false);
    }
  };

  return {
    form,
    loading,
    deleting,
    isNew,
    handleSubmit,
    handleDelete,
  };
}
