import HomePageComponent from "@/app/components/pages_components/HomePage";
import { getMenuByLocation } from "@/app/admin/actions/menus";
import { listPostsAPI } from "@/app/admin/actions/posts";
import {
  actionItems,
  authorsMockData,
  citationInfoMockData,
  footerItems,
  HomeCategories,
  heroText,
  navigation as fallbackNavigation,
  postsMockData,
  sourcesMockData,
} from "@/app/Data";
import type { CategoryButton, NavItem } from "@/app/types";

export const revalidate = 60;

export default async function HomePage() {
  const [headerMenu, heroGrid, heroActions, heroStrip, postsResult] = await Promise.all([
    getMenuByLocation("HEADER"),
    getMenuByLocation("HERO_GRID"),
    getMenuByLocation("HERO_ACTIONS"),
    getMenuByLocation("HERO_STRIP"),
    listPostsAPI({ status: "published", limit: 4, sort: "createdAt", order: "desc" }),
  ]);

  const categories: CategoryButton[] =
    heroGrid && heroGrid.items.length > 0
      ? heroGrid.items.map((item) => ({
          id: item.id || item.label.default,
          title: item.label.default,
          icon: item.icon || "FaHome",
          href: item.url || "#",
          hoverColor: "text-yellow-300",
        }))
      : HomeCategories;

  const stripItems =
    heroStrip && heroStrip.items.length > 0
      ? heroStrip.items.map((item) => ({
          label: item.label.default,
          icon: item.icon || "FaBook",
          href: item.url || "#",
        }))
      : footerItems;

  const dbPosts = postsResult.posts.map((p) => ({
    id: p.id,
    title: p.title,
    excerpt: p.excerpt || "",
    date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("he-IL") : "",
    author: p.author?.name || "",
    imageUrl: p.thumbnail?.url || "/images/post1.jpg",
  }));

  const posts = dbPosts.length > 0 ? dbPosts : postsMockData;

  const navigation: NavItem[] =
    headerMenu && headerMenu.items.length > 0
      ? headerMenu.items.map((item) => ({
          label: item.label.default,
          icon: item.icon || null,
          href: item.url || "#",
          subItems: item.children?.length
            ? item.children.map((child) => ({
                label: child.label.default,
                icon: child.icon || null,
                href: child.url || "#",
              }))
            : undefined,
        }))
      : fallbackNavigation;

  return (
    <HomePageComponent
      heroText={heroText}
      actionItems={actionItems}
      categories={categories}
      footerItems={stripItems}
      navigation={navigation}
      posts={posts}
      sources={sourcesMockData}
      authors={authorsMockData}
      citationInfo={citationInfoMockData}
    />
  );
}
