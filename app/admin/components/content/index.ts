/**
 * Content System Components
 * Modular, reusable components for admin content management
 */

// Types
export * from "@/app/admin/types/content-system.types";

// Core Input Components
export { GhostInput, GhostTextarea } from "./ghost-input";
export { FloatingLabelInput } from "./floating-label-input";
export { InlineField } from "./inline-field";

// Status & Display Components
export { StatusDot } from "./status-dot";
export { FastEditCell } from "./fast-edit-cell";

// Table Components
export { ContentTable } from "./content-table";
export { TablePagination } from "./table-pagination";
export { BulkActionsBar } from "./bulk-actions-bar";

// Page Template Components
export { ContentPageTemplate, ContentPageSection } from "./content-page-template";
export { ContentPageHeader } from "./content-page-header";

// Editor Layout Components (Legacy)
export {
  ContentEditorLayout,
  EditorZoneB,
  EditorZoneC,
  EditorZoneD,
  EditorTitle,
} from "./content-editor-layout";
export { SmartRibbon, SmartRibbonDivided, SmartRibbonRow } from "./smart-ribbon";
export { MetaDeck } from "./meta-deck";
export { ContentCanvas, ContentCanvasPreview } from "./content-canvas";

// Loop-Style Editor Components (New)
export { LoopStyleEditor, SidebarCard, SidebarField } from "./loop-style-editor";
export { UnifiedCanvas, UnifiedCanvasSeparator } from "./unified-canvas";
export { MetadataSidebar } from "./metadata-sidebar";
export { SlashCommands, useSlashCommands } from "./slash-commands";
export { EditorContextMenu } from "./editor-context-menu";
export { FileTree } from "./file-tree";
export { SearchableSelect, TagInput } from "./searchable-select";
export { FileUploadWidget } from "./file-upload-widget";
export { ThumbnailUpload } from "./thumbnail-upload";
export { JsonDropzone } from "./json-dropzone";

// i18n Components
export { LanguageToggle } from "./language-toggle";
export {
  ContentLanguageProvider,
  useContentLanguage,
  useTranslatableField,
} from "./content-language-context";

