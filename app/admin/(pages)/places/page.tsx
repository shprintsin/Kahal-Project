import { createAdminPage } from "@/lib/admin/create-page";
import { getPlaces } from "../../actions/places";
import PlacesClient from "../../tables/places-table";

export default createAdminPage({
  titleKey: 'pages.places.title',
  descriptionKey: 'pages.places.description',
  getData: getPlaces,
  Component: PlacesClient,
  dataPropName: 'initialPlaces',
});
