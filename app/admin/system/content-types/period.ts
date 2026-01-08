
import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const PeriodType: ContentTypeDefinition = {
  name: "Period",
  plural: "Periods",
  slug: "periods",
  icon: "Calendar", 
  
  model: "Period",
  
  fields: [
    createField.text("name", "Name", { required: true, order: 1 }),
    createField.slug("slug", "name", "/period/"),
    createField.date("dateStart", "Start Date", { showInEditor: true, showInList: true }),
    createField.date("dateEnd", "End Date", { showInEditor: true, showInList: true }),
  ],
  
  sidebar: {
    group: "Taxonomy",
    order: 3,
  },
  
  actions: "auto",
};

registerContentType(PeriodType);
