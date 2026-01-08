"use client";

/**
 * useContentTypeNavigation Hook
 * 
 * Generates sidebar navigation items from the content type registry.
 * Can be used to build dynamic navigation that updates when content types change.
 */

import * as React from "react";
import * as Icons from "lucide-react";
import { usePathname } from "next/navigation";
import { getAllContentTypes, getContentTypesByGroup, type ContentTypeDefinition } from "../content-type-registry";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  group: string;
  order: number;
}

export interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

/**
 * Get flat list of navigation items from content types
 */
export function useContentTypeNavigation() {
  const pathname = usePathname();
  
  const items = React.useMemo(() => {
    const contentTypes = getAllContentTypes();
    
    return contentTypes.map((ct): NavigationItem => {
      const IconComponent = (Icons as any)[ct.icon as string] || Icons.FileText;
      
      return {
        id: ct.slug,
        label: ct.plural,
        href: `/admin/${ct.slug}`,
        icon: IconComponent,
        isActive: pathname?.startsWith(`/admin/${ct.slug}`) ?? false,
        group: ct.sidebar.group,
        order: ct.sidebar.order,
      };
    });
  }, [pathname]);
  
  return items;
}

/**
 * Get navigation items grouped by sidebar group
 */
export function useGroupedNavigation(): NavigationGroup[] {
  const pathname = usePathname();
  
  const groups = React.useMemo(() => {
    const byGroup = getContentTypesByGroup();
    
    return Object.entries(byGroup).map(([groupName, contentTypes]) => ({
      name: groupName,
      items: contentTypes.map((ct): NavigationItem => {
         const IconComponent = (Icons as any)[ct.icon as string] || Icons.FileText;
         
         return {
          id: ct.slug,
          label: ct.plural,
          href: `/admin/${ct.slug}`,
          icon: IconComponent,
          isActive: pathname?.startsWith(`/admin/${ct.slug}`) ?? false,
          group: groupName,
          order: ct.sidebar.order,
        };
      }),
    }));
  }, [pathname]);
  
  return groups;
}

/**
 * Get a specific content type by current route
 */
export function useCurrentContentType(): ContentTypeDefinition | undefined {
  const pathname = usePathname();
  
  return React.useMemo(() => {
    if (!pathname) return undefined;
    
    const contentTypes = getAllContentTypes();
    return contentTypes.find(ct => pathname.startsWith(`/admin/${ct.slug}`));
  }, [pathname]);
}
