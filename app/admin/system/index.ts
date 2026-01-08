/**
 * Content System - Main Export
 * 
 * Unified content management system with configurable content types.
 */

// Core registry
export {
  // Types
  type ContentTypeDefinition,
  type FieldDefinition,
  type FieldType,
  type DisplayType,
  type SelectOption,
  
  // Registry functions
  registerContentType,
  getContentType,
  getAllContentTypes,
  getContentTypesByGroup,
  
  // Field helpers
  createField,
  
  // Schema generation
  generateSchema,
} from "./content-type-registry";

// Field type registry
export {
  type ListCellProps,
  type EditorFieldProps,
  type ListCellComponent,
  type EditorFieldComponent,
  type FieldTypeConfig,
  
  getFieldTypeConfig,
  getListComponent,
  getEditorComponent,
  supportsFastEdit,
  registerFieldType,
} from "./field-type-registry";

// Components
export { DynamicTable } from "./dynamic-table";
export { DynamicEditor, useDynamicForm } from "./dynamic-editor";
export { ContentTypeListPage } from "./content-type-list-page";
export { ContentTypeEditorPage } from "./content-type-editor-page";

// Actions
export {
  type ListOptions,
  type ListResult,
  type GenericActions,
  createGenericActions,
  getActionsForContentType,
} from "./create-generic-actions";

// Hooks
export {
  useContentTypeNavigation,
  useGroupedNavigation,
  useCurrentContentType,
  type NavigationItem,
  type NavigationGroup,
} from "./hooks";

// Register all content types
import "./content-types";

// Re-export specific content types
export { ArticleType, PostType, PageType, CategoryType, TagType } from "./content-types";
