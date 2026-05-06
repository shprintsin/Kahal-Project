/**
 * Site content seed — idempotent.
 *
 * Owns all "chrome" content for the public site:
 *   - SiteSettings (copyright, research team, citation, homepage stats)
 *   - Menus + items (HEADER, HERO_GRID, HERO_ACTIONS, HERO_STRIP, FOOTER)
 *   - FooterColumns + items (footer blocks: link lists / rich text)
 *   - SiteLinks (homepage "Links" widget)
 *
 * Re-run after editing any constant below to push the change to DB:
 *   npx tsx prisma/seed-site-content.ts
 *
 * Strategy: delete-and-recreate per section. Safe because none of these
 * tables are referenced by foreign keys from other content.
 */

import { PrismaClient, Prisma, MenuLocation, MenuType } from "@prisma/client";

const prisma = new PrismaClient();

type I18n<T> = { he: T; en: T };
type Author = { name: string; role: string; affiliation: string };

// ---------------------------------------------------------------------------
// 1. Site settings: copyright, research team, citation, homepage stats
// ---------------------------------------------------------------------------

const COPYRIGHT_I18N: I18n<string> = {
  he: "© 2026 ShtetlAtlas. כל הזכויות שמורות.",
  en: "© 2026 The ShtetlAtlas Project. All rights reserved.",
};

const RESEARCH_TEAM_I18N: I18n<Author[]> = {
  he: [
    { name: 'ד"ר יניי שפיצר', role: "חוקר ראשי", affiliation: "האוניברסיטה העברית בירושלים" },
    { name: "שניאור שפרינצין", role: "עוזר מחקר", affiliation: "האוניברסיטה העברית בירושלים" },
  ],
  en: [
    { name: "Dr. Yannay Spitzer", role: "Principal Investigator", affiliation: "The Hebrew University of Jerusalem" },
    { name: "Shneor Shprintsin", role: "Research Assistant", affiliation: "The Hebrew University of Jerusalem" },
  ],
};

const CITATION_I18N: I18n<string> = {
  en: "Spitzer, Y., Shprintsin, S. (2024). The Eastern European Jewish Communities Project. The Hebrew University of Jerusalem.",
  he: "שפיצר, י׳, שפרינצין, ש׳ (2024). פרויקט קהילות יהודי מזרח אירופה. האוניברסיטה העברית בירושלים.",
};

// Homepage stat overrides. Leave a value empty/missing to fall back to a live
// DB count (places / published datasets / datasets+layers / "1000+").
const HOMEPAGE_STATS: { communities: string; datasets: string; maps: string; years: string } = {
  communities: "1,300",
  datasets: "7",
  maps: "28",
  years: "1000+",
};

const SITE_SETTINGS_DATA = {
  copyright: COPYRIGHT_I18N as Prisma.InputJsonValue,
  researchTeam: RESEARCH_TEAM_I18N as unknown as Prisma.InputJsonValue,
  citation: CITATION_I18N as Prisma.InputJsonValue,
  homepageStats: HOMEPAGE_STATS as Prisma.InputJsonValue,
} satisfies Prisma.SiteSettingsUpdateInput;

// ---------------------------------------------------------------------------
// 2. Menus
// ---------------------------------------------------------------------------

type MenuItemSeed = Omit<
  Prisma.MenuItemCreateWithoutMenuInput,
  "id" | "createdAt" | "updatedAt" | "menu" | "page" | "parent" | "children" | "order"
>;

const MENUS: Record<MenuLocation, MenuItemSeed[]> = {
  HEADER: [
    { label: { he: "מאמרים", en: "Posts" }, url: "/posts" },
    { label: { he: "מפות", en: "Maps" }, url: "/maps" },
    { label: { he: "שכבות", en: "Layers" }, url: "/layers" },
    { label: { he: "נתונים", en: "Data" }, url: "/data" },
    { label: { he: "ארכיון", en: "Archive" }, url: "/archive" },
    { label: { he: "אודות", en: "About" }, url: "/about" },
  ],
  HERO_ACTIONS: [
    { label: { he: "חפשו במפות", en: "Explore Maps" }, url: "/maps", icon: "Map", variant: "BUTTON_SOLID" },
    { label: { he: "עיינו בנתונים", en: "Browse Data" }, url: "/data", icon: "Database", variant: "BUTTON_OUTLINE" },
  ],
  HERO_GRID: [
    { label: { he: "מפות", en: "Maps" }, url: "/maps", icon: "Map", variant: "CARD" },
    { label: { he: "נתונים", en: "Data" }, url: "/data", icon: "Database", variant: "CARD" },
    { label: { he: "ארכיון", en: "Archive" }, url: "/archive", icon: "BookOpen", variant: "CARD" },
    { label: { he: "מאמרים", en: "Posts" }, url: "/posts", icon: "FileText", variant: "CARD" },
  ],
  HERO_STRIP: [
    { label: { he: "קהילות", en: "Communities" }, url: "/categories/communities", icon: "Users" },
    { label: { he: "היסטוריה", en: "History" }, url: "/categories/history", icon: "Clock" },
    { label: { he: "דמוגרפיה", en: "Demographics" }, url: "/categories/demographics", icon: "BarChart" },
  ],
  FOOTER: [
    { label: { he: "מדיניות פרטיות", en: "Privacy Policy" }, url: "/privacy" },
    { label: { he: "תנאי שימוש", en: "Terms of Use" }, url: "/terms" },
    { label: { he: "נגישות", en: "Accessibility" }, url: "/accessibility" },
    { label: { he: "צור קשר", en: "Contact" }, url: "/contact" },
  ],
};

// ---------------------------------------------------------------------------
// 3. Footer columns (blocks)
// ---------------------------------------------------------------------------

type FooterItemSeed = Omit<
  Prisma.FooterColumnItemCreateWithoutFooterColumnInput,
  "id" | "createdAt" | "updatedAt" | "page" | "order"
>;

type FooterColumnSeed =
  | {
      type: Extract<MenuType, "LINK_LIST">;
      title: Prisma.InputJsonValue;
      items: FooterItemSeed[];
    }
  | {
      type: Extract<MenuType, "RICH_TEXT">;
      title: Prisma.InputJsonValue;
      content: Prisma.InputJsonValue;
    };

const FOOTER_COLUMNS: FooterColumnSeed[] = [
  {
    type: "LINK_LIST",
    title: { he: "ניווט", en: "Navigation" },
    items: [
      { label: { he: "מאמרים", en: "Posts" }, url: "/posts" },
      { label: { he: "מפות", en: "Maps" }, url: "/maps" },
      { label: { he: "נתונים", en: "Data" }, url: "/data" },
      { label: { he: "ארכיון", en: "Archive" }, url: "/archive" },
    ],
  },
  {
    type: "LINK_LIST",
    title: { he: "מידע", en: "Information" },
    items: [
      { label: { he: "אודות", en: "About" }, url: "/about" },
      { label: { he: "צור קשר", en: "Contact" }, url: "/contact" },
      { label: { he: "מדיניות פרטיות", en: "Privacy Policy" }, url: "/privacy" },
      { label: { he: "תנאי שימוש", en: "Terms of Use" }, url: "/terms" },
      { label: { he: "נגישות", en: "Accessibility" }, url: "/accessibility" },
    ],
  },
  {
    type: "RICH_TEXT",
    title: { he: "אודות", en: "About" },
    content: {
      he: "פרויקט קהילות יהודי מזרח אירופה הוא יוזמת מחקר המתעדת אלף שנות היסטוריה של קהילות יהודיות במזרח אירופה.",
      en: "The Eastern European Jewish Communities Project is a research initiative documenting 1000 years of history of Jewish communities in Eastern Europe.",
    },
  },
];

// ---------------------------------------------------------------------------
// 4. Site links (homepage "Links" widget)
// ---------------------------------------------------------------------------

type SiteLinkSeed = Omit<
  Prisma.SiteLinkCreateInput,
  "id" | "createdAt" | "updatedAt" | "order" | "status"
>;

const SITE_LINKS: SiteLinkSeed[] = [
  {
    title: { he: "מנוע חיפוש קהילות", en: "Community Search Engine" },
    description: { he: "חיפוש לפי שם, מחוז או גוברניה", en: "Search by name, district, or governorate" },
    icon: "Globe",
    url: "/search",
  },
  {
    title: { he: "כלי השוואת מפקדים", en: "Census Comparison Tool" },
    description: { he: "השוואת נתונים בין מפקדים שונים", en: "Compare data across different censuses" },
    icon: "Database",
    url: "/tools/census-compare",
  },
  {
    title: { he: "ארכיון מסמכים דיגיטלי", en: "Digital Document Archive" },
    description: { he: "דפדוף בתעודות סרוקות", en: "Browse scanned documents" },
    icon: "Scroll",
    url: "/archive",
  },
  {
    title: { he: "מפה אינטראקטיבית", en: "Interactive Map" },
    description: { he: "צפייה בשכבות היסטוריות", en: "View historical layers" },
    icon: "Map",
    url: "/maps",
  },
];

// ---------------------------------------------------------------------------
// Seeders
// ---------------------------------------------------------------------------

async function seedSiteSettings(): Promise<void> {
  const create: Prisma.SiteSettingsCreateInput = { key: "global", ...SITE_SETTINGS_DATA };
  const update: Prisma.SiteSettingsUpdateInput = SITE_SETTINGS_DATA;
  await prisma.siteSettings.upsert({ where: { key: "global" }, create, update });
}

async function seedMenus(): Promise<void> {
  // MenuItem.menu has onDelete cascade — items get cleared with the menu.
  await prisma.menu.deleteMany({});
  for (const [location, items] of Object.entries(MENUS) as [MenuLocation, MenuItemSeed[]][]) {
    if (items.length === 0) continue;
    const data: Prisma.MenuCreateInput = {
      location,
      items: {
        create: items.map<Prisma.MenuItemCreateWithoutMenuInput>((item, idx) => ({
          ...item,
          variant: item.variant ?? "DEFAULT",
          order: idx + 1,
        })),
      },
    };
    await prisma.menu.create({ data });
  }
}

async function seedFooterColumns(): Promise<void> {
  await prisma.footerColumn.deleteMany({});
  for (let i = 0; i < FOOTER_COLUMNS.length; i++) {
    const col = FOOTER_COLUMNS[i];
    const base = { type: col.type, order: i + 1, title: col.title };
    const data: Prisma.FooterColumnCreateInput =
      col.type === "LINK_LIST"
        ? {
            ...base,
            items: {
              create: col.items.map<Prisma.FooterColumnItemCreateWithoutFooterColumnInput>((item, idx) => ({
                ...item,
                order: idx + 1,
              })),
            },
          }
        : { ...base, content: col.content };
    await prisma.footerColumn.create({ data });
  }
}

async function seedSiteLinks(): Promise<void> {
  await prisma.siteLink.deleteMany({});
  for (let i = 0; i < SITE_LINKS.length; i++) {
    const data: Prisma.SiteLinkCreateInput = {
      ...SITE_LINKS[i],
      order: i + 1,
      status: "published",
    };
    await prisma.siteLink.create({ data });
  }
}

async function main(): Promise<void> {
  console.log("Seeding site content...");
  await seedSiteSettings();
  console.log("  ✓ SiteSettings (copyright, research team, citation, stats)");
  await seedMenus();
  console.log(`  ✓ ${Object.keys(MENUS).length} menus`);
  await seedFooterColumns();
  console.log(`  ✓ ${FOOTER_COLUMNS.length} footer columns`);
  await seedSiteLinks();
  console.log(`  ✓ ${SITE_LINKS.length} site links`);
  console.log("Done.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
