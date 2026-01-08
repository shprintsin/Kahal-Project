
import { ContentTypeDefinition, createField, registerContentType } from "../content-type-registry";

export const PlaceType: ContentTypeDefinition = {
  name: "Place",
  plural: "Places",
  slug: "places",
  icon: "MapPin", 
  
  model: "Place",
  
  fields: [
    createField.text("geoname", "Name", { required: true, order: 1 }),
    createField.slug("geocode", "geoname", "/place/"),
    createField.text("countryCode", "Country", { width: "100px", order: 2 }),
    createField.number("lat", "Latitude", { showInList: false, order: 3 }),
    createField.number("lon", "Longitude", { showInList: false, order: 4 }),
    createField.text("admin1", "Admin 1", { showInList: false }),
    createField.text("admin2", "Admin 2", { showInList: false }),
  ],
  
  sidebar: {
    group: "Taxonomy",
    order: 4,
  },
  
  actions: "auto",
};

registerContentType(PlaceType);
