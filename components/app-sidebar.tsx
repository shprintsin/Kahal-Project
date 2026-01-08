"use client"

import * as React from "react"
import {
  FileText,
  FolderTree,
  Database,
  Map,
  Users,
  Settings,
  Tags,
  Layers,
} from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/lib/i18n/language-provider"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    id: string
    email: string
    name: string | null
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { t, isRtl } = useLanguage();
  const safeUser = user ?? { id: "guest", email: "", name: "Guest" };

  const userData = {
    name: safeUser.name || safeUser.email,
    email: safeUser.email,
    avatar: `/avatars/${safeUser.id}.jpg`,
  };

  // CMS Navigation Data with translations
  const navData = {
    navMain: [
      {
        title: t('nav.content'),
        url: "#",
        icon: FileText,
        isActive: true,
        items: [
          { title: t('nav.posts'), url: "/admin/posts" },
          { title: t('nav.pages'), url: "/admin/pages" },
          { title: t('nav.taxonomyManager'), url: "/admin/taxonomy" },
          // { title: t('nav.categories'), url: "/admin/categories" },
        ],
      },
      {
        title: t('nav.research'),
        url: "#",
        icon: Database,
        isActive: true,
        items: [
          { title: t('nav.collections'), url: "/admin/collections" },
          { title: t('nav.documents'), url: "/admin/documents" },
          { title: t('nav.artifacts'), url: "/admin/artifacts" },
          // { title: t('nav.artifactCategories'), url: "/admin/artifact-categories" },
          // { title: t('nav.series'), url: "/admin/series" },
          { title: t('nav.datasets'), url: "/admin/datasets" },
          { title: t('nav.layers'), url: "/admin/layers" },
          { title: t('nav.maps'), url: "/admin/maps" },
        ],
      },

      {
        title: t('nav.system'),
        url: "#",
        icon: Settings,
        isActive: true,
        items: [
          { title: t('nav.media'), url: "/admin/media" },
          { title: t('nav.menus'), url: "/admin/settings/menus" },
          { title: t('nav.users'), url: "/admin/users" },
          { title: t('nav.settings'), url: "/admin/settings" },
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" side={isRtl ? "right" : "left"} {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex-1">
            <NavUser user={userData} />
          </div>
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navData.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
