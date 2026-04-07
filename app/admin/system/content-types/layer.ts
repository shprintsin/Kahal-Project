/**
 * Layer Content Type
 *
 * Map data layers (points, polygons, lines) belonging to a Dataset.
 */

import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const LayerType: ContentTypeDefinition = {
  name: "Layer",
  plural: "Layers",
  slug: "layers",
  icon: "Layers",

  model: "Layer",

  fields: [
    createField.text("name", "Name", { required: true, order: 1 }),
    createField.translatable("nameI18n", "Name (i18n)"),
    createField.slug("slug", "name", "/layers/"),
    createField.text("description", "Description", {
      showInList: false,
      rows: 3,
      order: 2,
    }),
    createField.translatable("descriptionI18n", "Description (i18n)"),
    createField.text("summary", "Summary", {
      showInList: false,
      order: 3,
      placeholder: "Short description for cards and listings",
    }),
    {
      key: "status",
      label: "Status",
      type: "status",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 4,
      listDisplay: "status-dot",
      zone: "sidebar",
    },
    {
      key: "type",
      label: "Layer Type",
      type: "select",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 5,
      options: [
        { value: "POINTS", label: "Points" },
        { value: "POLYGONS", label: "Polygons" },
        { value: "LINES", label: "Lines" },
        { value: "RASTER", label: "Raster" },
      ],
      listDisplay: "badge",
    },
    {
      key: "sourceType",
      label: "Source Type",
      type: "select",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 6,
      options: [
        { value: "database", label: "Database" },
        { value: "url", label: "URL" },
        { value: "inline", label: "Inline" },
      ],
      listDisplay: "badge",
      zone: "sidebar",
    },
    createField.text("sourceUrl", "Source URL", {
      showInList: false,
      order: 7,
      zone: "sidebar",
    }),
    {
      key: "datasetId",
      label: "Dataset",
      type: "relation",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 8,
      relation: "Dataset",
      relationField: "title",
      listDisplay: "badge",
      zone: "sidebar",
    },
    {
      key: "categoryId",
      label: "Category",
      type: "relation",
      showInList: true,
      showInEditor: true,
      editable: true,
      order: 9,
      relation: "Category",
      relationField: "title",
      listDisplay: "badge",
      zone: "sidebar",
    },
    {
      key: "styleConfig",
      label: "Style Config",
      type: "json",
      showInList: false,
      showInEditor: true,
      editable: true,
      order: 10,
      zone: "main",
    },
    createField.boolean("isFeatured", "Featured", { showInList: true, order: 11, zone: "sidebar" }),
    createField.date("createdAt", "Created"),
    createField.date("updatedAt", "Updated"),
  ],

  sidebar: {
    group: "Maps",
    order: 2,
  },

  features: {
    search: true,
    filter: true,
    bulkActions: true,
  },

  actions: "auto",
};

registerContentType(LayerType);
