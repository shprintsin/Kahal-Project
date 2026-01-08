"use client";

/**
 * Content System Types
 * Core TypeScript types for the modular content management system
 */

// ============================================================================
// Status & Language Types
// ============================================================================

/** Content publication status */
export type ContentStatus = "draft" | "published" | "archived" | "changes_requested";

/** Supported i18n language codes */
export type ContentLanguage = "en" | "pl" | "he";

/** Language display configuration */
export interface LanguageConfig {
  code: ContentLanguage;
  label: string;
  flag: string;
}

/** Default language configurations */
export const CONTENT_LANGUAGES: LanguageConfig[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "pl", label: "Polish", flag: "🇵🇱" },
  { code: "he", label: "Hebrew", flag: "🇮🇱" },
];

// ============================================================================
// Translatable Content Types
// ============================================================================

/** Generic translatable content structure */
export interface TranslatableContent<T = string> {
  en?: T;
  pl?: T;
  he?: T;
}

/** Get translation for a specific language with fallback */
export function getTranslation<T>(
  content: TranslatableContent<T> | undefined,
  lang: ContentLanguage,
  fallback?: T
): T | undefined {
  if (!content) return fallback;
  return content[lang] ?? content.en ?? fallback;
}

// ============================================================================
// Content Item Types (for Table Views)
// ============================================================================

/** Author information */
export interface ContentAuthor {
  id: string;
  name: string;
  email: string;
}

/** Base content item for table display */
export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  author?: ContentAuthor;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/** Extended content item with translatable fields */
export interface TranslatableContentItem extends ContentItem {
  titleI18n: TranslatableContent<string>;
  slugI18n: TranslatableContent<string>;
  language: ContentLanguage;
  translationGroupId?: string;
}

// ============================================================================
// Fast Edit Mode Types
// ============================================================================

/** Field change record for Fast Edit mode */
export interface FieldChange {
  rowId: string;
  field: string;
  originalValue: unknown;
  newValue: unknown;
}

/** Fast Edit state management */
export interface FastEditState {
  enabled: boolean;
  dirtyFields: Set<string>;
  pendingChanges: Map<string, FieldChange>;
}

/** Create initial Fast Edit state */
export function createFastEditState(): FastEditState {
  return {
    enabled: false,
    dirtyFields: new Set(),
    pendingChanges: new Map(),
  };
}

// ============================================================================
// Table Column Types
// ============================================================================

/** Column definition for content tables */
export interface ContentTableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => unknown);
  editable?: boolean;
  editType?: "text" | "select" | "date" | "number";
  editOptions?: { value: string; label: string }[];
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (row: T, isEditing: boolean) => React.ReactNode;
}

/** Table configuration */
export interface ContentTableConfig<T> {
  columns: ContentTableColumn<T>[];
  rowKey: keyof T | ((row: T) => string);
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  fastEditable?: boolean;
}

// ============================================================================
// Editor Layout Types
// ============================================================================

/** Smart Ribbon field configuration */
export interface SmartRibbonField {
  key: string;
  label: string;
  value: string;
  type: "text" | "select" | "date" | "readonly";
  width?: "auto" | "fixed" | "flex";
  options?: { value: string; label: string }[];
  placeholder?: string;
  dir?: "rtl" | "ltr";
}

/** Meta Deck configuration */
export interface MetaDeckConfig {
  excerpt?: {
    value: string;
    placeholder?: string;
    maxLength?: number;
  };
  description?: {
    value: string;
    placeholder?: string;
    maxLength?: number;
  };
}

/** Editor zone definitions */
export interface ContentEditorZones {
  /** Zone A: Top bar with navigation and actions */
  topBar?: React.ReactNode;
  /** Zone B: Title and Smart Ribbon */
  ribbon?: React.ReactNode;
  /** Zone C: Collapsible meta deck */
  metaDeck?: React.ReactNode;
  /** Zone D: Main content canvas */
  canvas?: React.ReactNode;
}

// ============================================================================
// Component Props Types
// ============================================================================

/** Content Page Template props */
export interface ContentPageTemplateProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/** Content Page Header props */
export interface ContentPageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  fastEditEnabled?: boolean;
  onFastEditToggle?: () => void;
  showFastEditToggle?: boolean;
  actions?: React.ReactNode;
}

/** Bulk Actions Bar props */
export interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onStatusChange?: (status: ContentStatus) => void;
  onExport?: () => void;
  onClose?: () => void;
  visible?: boolean;
}

/** Status Dot props */
export interface StatusDotProps {
  status: ContentStatus;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

/** Ghost Input props */
export interface GhostInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  inputSize?: "sm" | "md" | "lg" | "xl";
}

/** Floating Label Input props */
export interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

/** Inline Field props */
export interface InlineFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
  type?: "text" | "select" | "date" | "readonly";
  options?: { value: string; label: string }[];
  placeholder?: string;
  dir?: "rtl" | "ltr";
}

/** Language Toggle props */
export interface LanguageToggleProps {
  languages?: LanguageConfig[];
  value: ContentLanguage;
  onChange: (lang: ContentLanguage) => void;
  size?: "sm" | "md" | "lg";
}

/** Content Canvas props */
export interface ContentCanvasProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxWidth?: string;
}
