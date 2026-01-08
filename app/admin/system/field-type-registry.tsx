/**
 * Field Type Registry
 * 
 * Maps field types to their UI components for list and editor views.
 * This provides the bridge between field definitions and actual React components.
 */

import * as React from "react";
import type { FieldDefinition, DisplayType } from "./content-type-registry";

// ============================================
// Component Registry Types
// ============================================

export interface ListCellProps {
  value: any;
  field: FieldDefinition;
  row: any;
  isEditing?: boolean;
  onChange?: (value: any) => void;
}

export interface EditorFieldProps {
  value: any;
  field: FieldDefinition;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export type ListCellComponent = React.ComponentType<ListCellProps>;
export type EditorFieldComponent = React.ComponentType<EditorFieldProps>;

export interface FieldTypeConfig {
  // Display in table
  listComponent: ListCellComponent;
  // Display in editor
  editorComponent: EditorFieldComponent;
  // Default display type for list
  defaultListDisplay: DisplayType;
  // Can be fast-edited in table
  supportsFastEdit: boolean;
}

// ============================================
// Default Components (Lazy Loaded)
// ============================================

// Text display for lists
const TextCell: ListCellComponent = ({ value, isEditing, onChange, field }) => {
  if (isEditing && field.editable) {
    return React.createElement("input", {
      type: "text",
      value: value || "",
      onChange: (e: any) => onChange?.(e.target.value),
      className: "w-full bg-transparent p-0 text-sm border-none outline-none focus:ring-0",
    });
  }
  return React.createElement("span", { className: "text-sm truncate" }, value || "—");
};

// Badge display for relations
const BadgeCell: ListCellComponent = ({ value }) => {
  if (!value) return React.createElement("span", { className: "text-muted-foreground" }, "—");
  const label = typeof value === "object" ? (value.name || value.title || value.label) : value;
  return React.createElement("span", {
    className: "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary",
  }, label);
};

// Status dot display
const StatusCell: ListCellComponent = ({ value, isEditing, onChange, field }) => {
  const statusColors: Record<string, string> = {
    draft: "bg-amber-500",
    published: "bg-emerald-500",
    archived: "bg-slate-500",
    pending: "bg-blue-500",
  };
  
  if (isEditing && field.editable && field.options) {
    return React.createElement("select", {
      value: value || "",
      onChange: (e: any) => onChange?.(e.target.value),
      className: "w-full bg-transparent p-0 text-sm border-none outline-none focus:ring-0 cursor-pointer",
    }, field.options.map(opt => 
      React.createElement("option", { key: opt.value, value: opt.value }, opt.label)
    ));
  }
  
  const color = statusColors[value] || "bg-gray-500";
  const label = field.options?.find(o => o.value === value)?.label || value;
  
  return React.createElement("div", { className: "flex items-center gap-2" }, [
    React.createElement("span", { key: "dot", className: `w-2 h-2 rounded-full ${color}` }),
    React.createElement("span", { key: "label", className: "text-sm capitalize" }, label),
  ]);
};

// Date display
const DateCell: ListCellComponent = ({ value }) => {
  if (!value) return React.createElement("span", { className: "text-muted-foreground" }, "—");
  const date = new Date(value);
  const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return React.createElement("span", { className: "text-sm text-muted-foreground" }, formatted);
};

// Boolean display
const BooleanCell: ListCellComponent = ({ value, isEditing, onChange }) => {
  if (isEditing) {
    return React.createElement("input", {
      type: "checkbox",
      checked: !!value,
      onChange: (e: any) => onChange?.(e.target.checked),
      className: "w-4 h-4",
    });
  }
  return React.createElement("span", {
    className: `w-4 h-4 rounded ${value ? "bg-emerald-500" : "bg-slate-300"}`,
  });
};

// Image thumbnail display
const ImageCell: ListCellComponent = ({ value }) => {
  if (!value) return React.createElement("div", { className: "w-10 h-10 bg-muted rounded" });
  const url = typeof value === "object" ? value.url : value;
  return React.createElement("img", {
    src: url,
    alt: "",
    className: "w-10 h-10 object-cover rounded",
  });
};

// Badge list for many relations
const BadgeListCell: ListCellComponent = ({ value }) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return React.createElement("span", { className: "text-muted-foreground" }, "—");
  }
  
  const items = value.slice(0, 3);
  const remaining = value.length - 3;
  
  return React.createElement("div", { className: "flex flex-wrap gap-1" }, [
    ...items.map((item: any, i: number) => {
      const label = typeof item === "object" ? (item.name || item.title || item.label) : item;
      return React.createElement("span", {
        key: i,
        className: "inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary",
      }, label);
    }),
    remaining > 0 && React.createElement("span", {
      key: "more",
      className: "text-xs text-muted-foreground",
    }, `+${remaining}`),
  ]);
};

// ============================================
// Editor Field Components
// ============================================

const TextEditor: EditorFieldComponent = ({ value, onChange, field, disabled }) => {
  return React.createElement("input", {
    type: "text",
    value: value || "",
    onChange: (e: any) => onChange(e.target.value),
    placeholder: field.placeholder,
    disabled,
    className: "w-full px-3 py-2 bg-background border rounded-md text-sm",
  });
};

const TextareaEditor: EditorFieldComponent = ({ value, onChange, field, disabled }) => {
  return React.createElement("textarea", {
    value: value || "",
    onChange: (e: any) => onChange(e.target.value),
    placeholder: field.placeholder,
    rows: field.rows || 4,
    disabled,
    className: "w-full px-3 py-2 bg-background border rounded-md text-sm resize-y",
  });
};

const SelectEditor: EditorFieldComponent = ({ value, onChange, field, disabled }) => {
  return React.createElement("select", {
    value: value || "",
    onChange: (e: any) => onChange(e.target.value),
    disabled,
    className: "w-full px-3 py-2 bg-background border rounded-md text-sm",
  }, [
    React.createElement("option", { key: "", value: "" }, `Select ${field.label}...`),
    ...(field.options || []).map(opt =>
      React.createElement("option", { key: opt.value, value: opt.value }, opt.label)
    ),
  ]);
};

const BooleanEditor: EditorFieldComponent = ({ value, onChange, disabled }) => {
  return React.createElement("input", {
    type: "checkbox",
    checked: !!value,
    onChange: (e: any) => onChange(e.target.checked),
    disabled,
    className: "w-4 h-4",
  });
};

// ============================================
// Field Type Registry
// ============================================

const fieldTypeRegistry: Record<string, FieldTypeConfig> = {
  text: {
    listComponent: TextCell,
    editorComponent: TextEditor,
    defaultListDisplay: "text",
    supportsFastEdit: true,
  },
  textarea: {
    listComponent: TextCell,
    editorComponent: TextareaEditor,
    defaultListDisplay: "truncate",
    supportsFastEdit: false,
  },
  markdown: {
    listComponent: TextCell,
    editorComponent: TextareaEditor,
    defaultListDisplay: "truncate",
    supportsFastEdit: false,
  },
  slug: {
    listComponent: TextCell,
    editorComponent: TextEditor,
    defaultListDisplay: "text",
    supportsFastEdit: true,
  },
  number: {
    listComponent: TextCell,
    editorComponent: TextEditor,
    defaultListDisplay: "text",
    supportsFastEdit: true,
  },
  status: {
    listComponent: StatusCell,
    editorComponent: SelectEditor,
    defaultListDisplay: "status-dot",
    supportsFastEdit: true,
  },
  select: {
    listComponent: BadgeCell,
    editorComponent: SelectEditor,
    defaultListDisplay: "badge",
    supportsFastEdit: true,
  },
  relation: {
    listComponent: BadgeCell,
    editorComponent: SelectEditor, // Will be replaced with SearchableSelect
    defaultListDisplay: "badge",
    supportsFastEdit: false,
  },
  "relation-many": {
    listComponent: BadgeListCell,
    editorComponent: TextEditor, // Will be replaced with TagInput
    defaultListDisplay: "badge-list",
    supportsFastEdit: false,
  },
  date: {
    listComponent: DateCell,
    editorComponent: TextEditor,
    defaultListDisplay: "date",
    supportsFastEdit: false,
  },
  datetime: {
    listComponent: DateCell,
    editorComponent: TextEditor,
    defaultListDisplay: "date",
    supportsFastEdit: false,
  },
  boolean: {
    listComponent: BooleanCell,
    editorComponent: BooleanEditor,
    defaultListDisplay: "boolean",
    supportsFastEdit: true,
  },
  thumbnail: {
    listComponent: ImageCell,
    editorComponent: TextEditor, // Will be replaced with ThumbnailUpload
    defaultListDisplay: "image",
    supportsFastEdit: false,
  },
};

// ============================================
// Registry Functions
// ============================================

export function getFieldTypeConfig(type: string): FieldTypeConfig | undefined {
  return fieldTypeRegistry[type];
}

export function getListComponent(field: FieldDefinition): ListCellComponent {
  const config = fieldTypeRegistry[field.type];
  return config?.listComponent || TextCell;
}

export function getEditorComponent(field: FieldDefinition): EditorFieldComponent {
  const config = fieldTypeRegistry[field.type];
  return config?.editorComponent || TextEditor;
}

export function supportsFastEdit(field: FieldDefinition): boolean {
  const config = fieldTypeRegistry[field.type];
  return config?.supportsFastEdit ?? false;
}

// Allow registering custom field types
export function registerFieldType(type: string, config: FieldTypeConfig): void {
  fieldTypeRegistry[type] = config;
}
