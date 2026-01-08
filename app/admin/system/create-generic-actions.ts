/**
 * Generic CRUD Actions Factory
 * 
 * Generates standard CRUD operations from a Prisma model name.
 * Used when content type has actions: "auto"
 */

import type { ContentTypeDefinition } from "./content-type-registry";
import {
  genericList,
  genericGet,
  genericCreate,
  genericUpdate,
  genericDelete,
  type ListOptions,
  type ListResult,
} from "./server-actions";

export type { ListOptions, ListResult };

export interface GenericActions<T = any> {
  list: (options?: ListOptions) => Promise<ListResult<T>>;
  get: (id: string) => Promise<T | null>;
  create: (data: any) => Promise<T>;
  update: (id: string, data: any) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

/**
 * Create generic CRUD actions for a content type
 * Returns BOUND Server Actions that can be passed to Client Components.
 */
export function createGenericActions(
  contentType: ContentTypeDefinition
): GenericActions {
  const model = contentType.model;
  const basePath = `/admin/${contentType.slug}`;
  
  // Calculate searchable fields
  const searchableFields = contentType.fields
    .filter(f => f.type === "text" || f.type === "textarea" || f.type === "markdown")
    .map(f => f.key);
    
  // Keys allowed for create/update
  const fieldKeys = contentType.fields.map(f => f.key);
  
  return {
    list: genericList.bind(null, model, searchableFields),
    get: genericGet.bind(null, model),
    create: genericCreate.bind(null, model, basePath, fieldKeys),
    update: genericUpdate.bind(null, model, basePath, fieldKeys),
    delete: genericDelete.bind(null, model, basePath),
  };
}

/**
 * Get actions for a content type (auto-generated or custom)
 */
export function getActionsForContentType(
  contentType: ContentTypeDefinition
): GenericActions {
  if (contentType.actions === "auto" || !contentType.actions) {
    return createGenericActions(contentType);
  }
  
  // Use custom actions
  return contentType.actions as GenericActions;
}
