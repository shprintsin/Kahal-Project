import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser, getUserProfile } from "./actions/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { loadTranslations } from "@/lib/i18n/load-translations";
import { LanguageProvider } from "@/lib/i18n/language-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get user profile
  const profile = await getUserProfile();

  // Read the sidebar state from cookies - default to true (open)
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";
  
  // Read language preference from cookies
  const language = cookieStore.get("language")?.value || "he_default";
  const initialTranslations = loadTranslations(language);

  return (
    <div className="dark">
      <LanguageProvider initialLanguage={language} initialTranslations={initialTranslations}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar user={profile || { id: user.id || '', email: user.email || '', name: user.name || user.email || null }} />
          <SidebarInset className="bg-background">
            {children}
          </SidebarInset>
        </SidebarProvider>
      </LanguageProvider>
    </div>
  );
}
