import { createAdminPage } from "@/lib/admin/create-page";
import { getPeriods } from "../../actions/periods";
import { PeriodsTable } from "../../tables/periods-table";

export default createAdminPage({
  titleKey: 'pages.periods.title',
  descriptionKey: 'pages.periods.description',
  getData: getPeriods,
  Component: PeriodsTable,
  dataPropName: 'periods',
});
