import type { FieldConfig } from "@/app/admin/components/editors/form-field-renderer";

interface MapFieldConfigs {
  basicInfo: FieldConfig[];
  temporal: FieldConfig[];
}

export function createMapFieldConfigs(): MapFieldConfigs {
  return {
    basicInfo: [
      {
        name: "slug",
        label: "Slug",
        type: "text",
        placeholder: "map-slug",
        description: "URL-friendly identifier",
      },
      {
        name: "titleI18n.en",
        label: "Title (EN)",
        type: "text",
        placeholder: "Map title in English",
      },
      {
        name: "titleI18n.he",
        label: "Title (HE)",
        type: "text",
        placeholder: "כותרת המפה בעברית",
      },
      {
        name: "descriptionI18n.en",
        label: "Description (EN)",
        type: "textarea",
        placeholder: "Map description in English",
      },
      {
        name: "descriptionI18n.he",
        label: "Description (HE)",
        type: "textarea",
        placeholder: "תיאור המפה בעברית",
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ],
      },
    ],
    temporal: [
      {
        name: "year",
        label: "Year",
        type: "number",
        placeholder: "1900",
      },
      {
        name: "yearMin",
        label: "Year From",
        type: "number",
        placeholder: "1800",
      },
      {
        name: "yearMax",
        label: "Year To",
        type: "number",
        placeholder: "1900",
      },
      {
        name: "period",
        label: "Period",
        type: "text",
        placeholder: "e.g., 19th Century",
      },
    ],
  };
}
