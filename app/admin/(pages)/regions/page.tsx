import { createAdminPage } from "@/lib/admin/create-page";
import { getRegions } from "../../actions/regions";
import RegionsClient from "../../tables/regions-table";

export default createAdminPage({
  titleKey: 'pages.regions.title',
  descriptionKey: 'pages.regions.description',
  getData: getRegions,
  Component: RegionsClient,
  dataPropName: 'initialRegions',
});
