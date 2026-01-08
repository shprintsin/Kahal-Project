"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "@/utils/safe-revalidate";
import type {
  MenuItem,
  MenuSection,
  FooterColumn,
  FooterColumnItem,
  SiteSettings,
  LocalizedText,
  MenuLocation,
} from "../types/menus";

// ===================================================
// Helper Functions
// ===================================================

/**
 * Convert database row to MenuItem with localized text
 */
function dbToMenuItem(item: any): MenuItem {
  return {
    id: item.id,
    menuId: item.menuId,
    parentId: item.parentId,
    label: {
      default: item.label || "",
      translations: item.labelI18n || {},
    },
    icon: item.icon,
    variant: item.variant,
    order: item.order,
    pageId: item.pageId,
    url: item.url,
    children: item.children ? item.children.map(dbToMenuItem) : [],
  };
}

/**
 * Convert MenuItem to database format
 */
function menuItemToDb(item: MenuItem, menuId: string, parentId?: string) {
  return {
    label: item.label.default,
    labelI18n: item.label.translations,
    icon: item.icon,
    variant: item.variant,
    order: item.order,
    pageId: item.pageId,
    url: item.url,
    menuId,
    parentId: parentId || null,
  };
}

/**
 * Convert database footer column to FooterColumn type
 */
function dbToFooterColumn(column: any): FooterColumn {
  const base = {
    id: column.id,
    order: column.order,
    title: {
      default: column.title || "",
      translations: column.titleI18n || {},
    },
  };

  if (column.type === "RICH_TEXT") {
    return {
      ...base,
      type: "RICH_TEXT",
      content: {
        default: column.content || "",
        translations: column.contentI18n || {},
      },
    };
  } else {
    return {
      ...base,
      type: "LINK_LIST",
      items: column.items
        ? column.items.map((item: any) => ({
            id: item.id,
            footerColumnId: item.footerColumnId,
            label: {
              default: item.label || "",
              translations: item.labelI18n || {},
            },
            icon: item.icon,
            order: item.order,
            pageId: item.pageId,
            url: item.url,
          }))
        : [],
    };
  }
}

// ===================================================
// Menu Actions
// ===================================================

/**
 * Get all menu items for a specific location
 */
export async function getMenuByLocation(location: MenuLocation): Promise<MenuSection | null> {
  const menu = await prisma.menu.findUnique({
    where: { location },
    include: {
      items: {
        where: { parentId: null }, // Only get top-level items
        orderBy: { order: "asc" },
        include: {
          children: {
            orderBy: { order: "asc" },
            include: {
              children: true, // Support 3 levels deep
            },
          },
        },
      },
    },
  });

  if (!menu) return null;

  return {
    id: menu.id,
    items: menu.items.map(dbToMenuItem),
  };
}

/**
 * Create or update a menu section
 */
export async function upsertMenu(
  location: MenuLocation,
  items: MenuItem[]
): Promise<MenuSection> {
  // First, find or create the menu
  let menu = await prisma.menu.findUnique({
    where: { location },
  });

  if (!menu) {
    menu = await prisma.menu.create({
      data: { location },
    });
  }

  // Delete all existing items for this menu
  await prisma.menuItem.deleteMany({
    where: { menuId: menu.id },
  });

  // Create new items
  const createdItems: any[] = [];

  for (const item of items) {
    const dbItem = menuItemToDb(item, menu.id);
    const created = await prisma.menuItem.create({
      data: dbItem,
    });
    createdItems.push(created);

    // Create children if any
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        const dbChild = menuItemToDb(child, menu.id, created.id);
        await prisma.menuItem.create({
          data: dbChild,
        });
      }
    }
  }

  revalidatePath("/admin/settings/menus");
  revalidatePath("/"); // Revalidate frontend

  return {
    id: menu.id,
    items: items,
  };
}

/**
 * Delete a menu item and its children
 */
export async function deleteMenuItem(itemId: string): Promise<void> {
  await prisma.menuItem.delete({
    where: { id: itemId },
  });

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");
}

/**
 * Reorder menu items
 */
export async function reorderMenuItems(
  items: Array<{ id: string; order: number }>
): Promise<void> {
  await Promise.all(
    items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  );

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");
}

// ===================================================
// Footer Column Actions
// ===================================================

/**
 * Get all footer columns
 */
export async function getFooterColumns(): Promise<FooterColumn[]> {
  const columns = await prisma.footerColumn.findMany({
    orderBy: { order: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  return columns.map(dbToFooterColumn);
}

/**
 * Create a footer column
 */
export async function createFooterColumn(
  column: Omit<FooterColumn, "id">
): Promise<FooterColumn> {
  const data: any = {
    type: column.type,
    order: column.order,
    title: column.title.default,
    titleI18n: column.title.translations,
  };

  if (column.type === "RICH_TEXT") {
    data.content = (column as any).content.default;
    data.contentI18n = (column as any).content.translations;
  }

  const created = await prisma.footerColumn.create({
    data,
    include: {
      items: true,
    },
  });

  // Create items if LINK_LIST type
  if (column.type === "LINK_LIST" && (column as any).items) {
    for (const item of (column as any).items) {
      await prisma.footerColumnItem.create({
        data: {
          footerColumnId: created.id,
          label: item.label.default,
          labelI18n: item.label.translations,
          icon: item.icon,
          order: item.order,
          pageId: item.pageId,
          url: item.url,
        },
      });
    }
  }

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");

  return dbToFooterColumn(created);
}

/**
 * Update a footer column
 */
export async function updateFooterColumn(
  id: string,
  column: FooterColumn
): Promise<FooterColumn> {
  const data: any = {
    type: column.type,
    order: column.order,
    title: column.title.default,
    titleI18n: column.title.translations,
  };

  if (column.type === "RICH_TEXT") {
    data.content = (column as any).content.default;
    data.contentI18n = (column as any).content.translations;
  }

  const updated = await prisma.footerColumn.update({
    where: { id },
    data,
    include: {
      items: true,
    },
  });

  // Update items if LINK_LIST type
  if (column.type === "LINK_LIST") {
    // Delete existing items
    await prisma.footerColumnItem.deleteMany({
      where: { footerColumnId: id },
    });

    // Create new items
    if (column.items) {
      for (const item of column.items) {
        await prisma.footerColumnItem.create({
          data: {
            footerColumnId: id,
            label: item.label.default,
            labelI18n: item.label.translations,
            icon: item.icon,
            order: item.order,
            pageId: item.pageId,
            url: item.url,
          },
        });
      }
    }
  }

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");

  return dbToFooterColumn(updated);
}

/**
 * Delete a footer column
 */
export async function deleteFooterColumn(id: string): Promise<void> {
  await prisma.footerColumn.delete({
    where: { id },
  });

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");
}

/**
 * Reorder footer columns
 */
export async function reorderFooterColumns(
  columns: Array<{ id: string; order: number }>
): Promise<void> {
  await Promise.all(
    columns.map((col) =>
      prisma.footerColumn.update({
        where: { id: col.id },
        data: { order: col.order },
      })
    )
  );

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");
}

// ===================================================
// Site Settings Actions
// ===================================================

/**
 * Get site settings (copyright text)
 */
export async function getSiteSettings(): Promise<{ copyrightText: LocalizedText } | null> {
  const settings = await prisma.siteSettings.findUnique({
    where: { key: "global" },
  });

  if (!settings) return null;

  return {
    copyrightText: {
      default: settings.copyrightText || "",
      translations: settings.copyrightI18n as Record<string, string>,
    },
  };
}

/**
 * Update site settings
 */
export async function updateSiteSettings(copyrightText: LocalizedText): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key: "global" },
    create: {
      key: "global",
      copyrightText: copyrightText.default,
      copyrightI18n: copyrightText.translations,
    },
    update: {
      copyrightText: copyrightText.default,
      copyrightI18n: copyrightText.translations,
    },
  });

  revalidatePath("/admin/settings/menus");
  revalidatePath("/");
}

// ===================================================
// Combined Get All Settings
// ===================================================

/**
 * Get complete site settings for the settings page
 */
export async function getAllSiteSettings(): Promise<SiteSettings> {
  const [siteSettings, header, heroGrid, heroActions, heroStrip, footerColumns] =
    await Promise.all([
      getSiteSettings(),
      getMenuByLocation("HEADER"),
      getMenuByLocation("HERO_GRID"),
      getMenuByLocation("HERO_ACTIONS"),
      getMenuByLocation("HERO_STRIP"),
      getFooterColumns(),
    ]);

  return {
    copyrightText: siteSettings?.copyrightText || { default: "", translations: {} },
    header: header || { id: "", items: [] },
    heroGrid: heroGrid || { id: "", items: [] },
    heroActions: heroActions || { id: "", items: [] },
    heroStrip: heroStrip || { id: "", items: [] },
    footerColumns: footerColumns || [],
  };
}
