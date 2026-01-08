import { createAdminPage } from "@/lib/admin/create-page";
import { getMedia } from "../../actions/media";
import { MediaLibrary } from "../../components/media-library";

export default createAdminPage({
  titleKey: 'pages.media.title',
  descriptionKey: 'pages.media.description',
  getData: getMedia,
  Component: MediaLibrary,
  dataPropName: 'media',
});
