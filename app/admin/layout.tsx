import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getUser, getUserProfile } from "./actions/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";

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

  // Load messages for the admin locale (admin always uses Hebrew)
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "he";
  const messages = (await import(`../../messages/${locale === "en" ? "en" : "he"}.json`)).default;

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar user={profile || { id: user.id || '', email: user.email || '', name: user.name || user.email || null }} />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
