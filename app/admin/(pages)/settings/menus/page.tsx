import { getAllSiteSettings } from "@/app/admin/actions/menus";
import { MenusSettingsClient } from "./menus-settings-client";

export default async function MenusSettingsPage() {
  const settings = await getAllSiteSettings();

  return <MenusSettingsClient initialSettings={settings} />;
}
