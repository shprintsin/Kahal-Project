import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const RegionType: ContentTypeDefinition = {
  name: "Region",
  plural: "Regions",
  slug: "regions",
  icon: "MapPin",

  model: "Region",

  fields: [
    createField.text("name", "Name", { required: true, order: 1 }),
    createField.translatable("nameI18n", "Name (i18n)"),
    createField.slug("slug", "name", "/region/"),
    createField.date("createdAt", "Created"),
  ],

  sidebar: {
    group: "Taxonomy",
    order: 5,
  },

  actions: "auto",
};

registerContentType(RegionType);
