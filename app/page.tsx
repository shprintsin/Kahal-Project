import HomePageComponent from "@/app/components/pages_components/HomePage";
import { getAllSiteSettings } from "@/app/admin/actions/menus";
import { listPostsAPI } from "@/app/admin/actions/posts";
import { listDatasetsAPI } from "@/app/admin/actions/datasets";
import { getNavigation } from "@/app/lib/get-navigation";

export default async function HomePage() {
  const [siteSettings, postsResult, datasetsResult, navigation] = await Promise.all([
    getAllSiteSettings(),
    listPostsAPI({ status: "published", limit: 4 }),
    listDatasetsAPI({ status: "published", limit: 4 }),
    getNavigation(),
  ]);

  const heroGrid = siteSettings.heroGrid?.items.map(item => ({
    id: item.id || item.order.toString(),
    title: item.label.default,
    icon: item.icon || "FaHome",
    href: item.url || "#",
    hoverColor: "text-yellow-300",
  })) || [];

  const heroActions = siteSettings.heroActions?.items.map(item => ({
    id: item.id || item.order.toString(),
    title: item.label.default,
    icon: item.icon || "",
    href: item.url || "#",
  })) || [];

  const heroStrip = siteSettings.heroStrip?.items.map(item => ({
    label: item.label.default,
    icon: item.icon || "FaCode",
    href: item.url || "#",
  })) || [];

  const posts = postsResult.posts.map(p => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt || "",
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("he-IL") : "",
    author: "",
    imageUrl: p.thumbnail?.url || "",
    slug: p.slug,
  }));

  const datasets = datasetsResult.datasets.map((d: any) => ({
    id: d.id,
    title: d.title,
    description: d.description || "",
    slug: d.slug,
    url: `/data/${d.slug}`,
  }));

  const copyrightText = siteSettings.copyrightText?.default || "© 2024 פרויקט הקהל. כל הזכויות שמורות.";
  const footerColumns = siteSettings.footerColumns || [];

  return (
    <HomePageComponent
      navigation={navigation}
      heroGrid={heroGrid}
      heroActions={heroActions}
      heroStrip={heroStrip}
      posts={posts}
      datasets={datasets}
      copyrightText={copyrightText}
      footerColumns={footerColumns}
    />
  );
}
