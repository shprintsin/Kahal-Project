import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const SiteLinkType: ContentTypeDefinition = {
  name: "SiteLink",
  plural: "Site Links",
  slug: "site-links",
  icon: "Link2",

  model: "SiteLink",

  fields: [
    createField.text("title", "Title", { required: true, order: 1 }),
    createField.text("url", "URL", { required: true, order: 2 }),
    createField.text("description", "Description", { order: 3 }),
    createField.text("icon", "Icon", { order: 4 }),
    createField.number("order", "Order", { order: 5 }),
    createField.status("status"),
    createField.date("createdAt", "Created"),
  ],

  sidebar: {
    group: "Site",
    order: 10,
  },

  actions: "auto",
};

registerContentType(SiteLinkType);
