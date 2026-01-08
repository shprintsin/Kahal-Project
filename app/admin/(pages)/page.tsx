import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Files,
  Tag,
  FolderTree,
  Database,
  Map,
  Image,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, getUserProfile } from "@/app/admin/actions/auth";
import { loadTranslations, getTranslation } from "@/lib/i18n/load-translations";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getUserProfile();

  // Load translations
  const cookieStore = await cookies();
  const language = cookieStore.get("language")?.value || "he_default";
  const translations = loadTranslations(language);
  const t = (key: string, fallback?: string) => getTranslation(translations, key, fallback);

  const quickLinks = [
    { title: t('nav.posts'), description: t('pages.posts.description'), icon: FileText, href: "/admin/posts", color: "text-blue-500" },
    { title: t('nav.pages'), description: t('pages.pages.description'), icon: Files, href: "/admin/pages", color: "text-green-500" },
    { title: t('nav.documents'), description: t('pages.documents.description'), icon: BookOpen, href: "/admin/documents", color: "text-orange-500" },
    { title: t('nav.categories'), description: t('pages.categories.description'), icon: Tag, href: "/admin/categories", color: "text-purple-500" },
    { title: t('nav.tags'), description: t('pages.tags.description'), icon: Tag, href: "/admin/tags", color: "text-pink-500" },
    { title: t('pages.archives.title'), description: t('pages.archives.description'), icon: FolderTree, href: "/admin/collections", color: "text-amber-500" },
    { title: t('nav.datasets'), description: t('pages.datasets.description'), icon: Database, href: "/admin/datasets", color: "text-cyan-500" },
    { title: t('nav.maps'), description: t('pages.maps.description'), icon: Map, href: "/admin/maps", color: "text-red-500" },
    { title: t('nav.media'), description: t('pages.media.description'), icon: Image, href: "/admin/media", color: "text-indigo-500" },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.welcomeBack')}, {profile?.name || user.email}!</h2>
        <p className="text-muted-foreground">{t('admin.panelDetails')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                  <Icon className={`h-4 w-4 ${link.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5" />
              {t('admin.quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/posts/new" className="block p-2 rounded-md hover:bg-accent transition-colors">
              <p className="font-medium">{t('admin.createNewPost')}</p>
              <p className="text-sm text-muted-foreground">{t('admin.startWriting')}</p>
            </Link>
            <Link href="/admin/pages/new" className="block p-2 rounded-md hover:bg-accent transition-colors">
              <p className="font-medium">{t('admin.createNewPage')}</p>
              <p className="text-sm text-muted-foreground">{t('admin.addPage')}</p>
            </Link>
            <Link href="/admin/media" className="block p-2 rounded-md hover:bg-accent transition-colors">
              <p className="font-medium">{t('admin.uploadMedia')}</p>
              <p className="text-sm text-muted-foreground">{t('admin.addFiles')}</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.recentActivity')}</CardTitle>
            <CardDescription>{t('messages.loading')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('admin.checkSections')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('admin.systemInfo')}</CardTitle>
            <CardDescription>{t('admin.panelDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('admin.version')}</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
