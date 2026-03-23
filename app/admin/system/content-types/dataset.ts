import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const DatasetType: ContentTypeDefinition = {
  name: "Dataset",
  plural: "Datasets",
  slug: "datasets",
  icon: "Database",

  model: "ResearchDataset",

  fields: [
    createField.text("title", "Title", { required: true, order: 1 }),
    createField.slug("slug", "title", "/data/"),
    createField.text("description", "Description", { showInList: false, order: 3 }),
    {
      key: "status",
      label: "Status",
      type: "status",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 4,
      display: { type: "status-dot" },
    },
    {
      key: "maturity",
      label: "Maturity",
      type: "select",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 5,
      options: [
        { value: "Provisional", label: "Provisional" },
        { value: "Validated", label: "Validated" },
        { value: "Final", label: "Final" },
      ],
      display: { type: "badge" },
    },
    createField.text("version", "Version", { showInList: true, order: 6 }),
    createField.number("minYear", "Min Year", { showInList: true, order: 7 }),
    createField.number("maxYear", "Max Year", { showInList: true, order: 8 }),
    createField.text("license", "License", { showInList: false, order: 9 }),
    createField.text("citationText", "Citation", { showInList: false, order: 10 }),
    {
      key: "categoryId",
      label: "Category",
      type: "relation",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 11,
      relationModel: "Category",
      relationField: "title",
      display: { type: "badge" },
      placement: "sidebar",
    },
    {
      key: "regions",
      label: "Regions",
      type: "relation-many",
      showInList: false,
      showInEditor: true,
      editable: true,
      order: 12,
      relationModel: "Region",
      relationField: "name",
      display: { type: "badge-list" },
      placement: "sidebar",
    },
    createField.boolean("isVisible", "Visible", { showInList: true, order: 13 }),
    createField.boolean("isFeatured", "Featured", { showInList: true, order: 14, placement: "sidebar" }),
    createField.date("createdAt", "Created"),
    createField.date("updatedAt", "Updated"),
  ],

  sidebar: {
    group: "Content",
    order: 3,
  },

  features: {
    search: true,
    filter: true,
    bulkActions: true,
  },

  actions: "auto",
};

registerContentType(DatasetType);
