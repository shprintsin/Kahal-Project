import { createAdminPage } from "@/lib/admin/create-page";
import { getArtifactCategories } from "../../actions/artifact-categories";
import { ArtifactCategoriesTable } from "../../tables/artifact-categories-table";

export default createAdminPage({
  titleKey: 'pages.artifactCategories.title',
  descriptionKey: 'pages.artifactCategories.description',
  getData: getArtifactCategories,
  Component: ArtifactCategoriesTable,
  dataPropName: 'categories',
});
