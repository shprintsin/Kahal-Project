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

type I18n<T> = { he: T; en: T; pl?: T } & Record<string, T | undefined>;
type Author = { name: string; role: string; affiliation: string };

// ---------------------------------------------------------------------------
// 1. Site settings: copyright, research team, citation, homepage stats
// ---------------------------------------------------------------------------

const COPYRIGHT_I18N: I18n<string> = {
  he: "© 2026 ShtetlAtlas. כל הזכויות שמורות.",
  en: "© 2026 The ShtetlAtlas Project. All rights reserved.",
  pl: "© 2026 Projekt ShtetlAtlas. Wszelkie prawa zastrzeżone.",
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
  copyrightText: COPYRIGHT_I18N.he,
  copyrightI18n: COPYRIGHT_I18N as Prisma.InputJsonValue,
  researchTeamI18n: RESEARCH_TEAM_I18N as unknown as Prisma.InputJsonValue,
  citationText: CITATION_I18N.en,
  citationTextI18n: CITATION_I18N as Prisma.InputJsonValue,
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
    { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts", pl: "Artykuły" }, url: "/posts" },
    { label: "מפות", labelI18n: { he: "מפות", en: "Maps", pl: "Mapy" }, url: "/maps" },
    { label: "שכבות", labelI18n: { he: "שכבות", en: "Layers", pl: "Warstwy" }, url: "/layers" },
    { label: "נתונים", labelI18n: { he: "נתונים", en: "Data", pl: "Dane" }, url: "/data" },
    { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive", pl: "Archiwum" }, url: "/archive" },
    { label: "אודות", labelI18n: { he: "אודות", en: "About", pl: "O nas" }, url: "/about" },
  ],
  HERO_ACTIONS: [
    { label: "חפשו במפות", labelI18n: { he: "חפשו במפות", en: "Explore Maps", pl: "Przeglądaj mapy" }, url: "/maps", icon: "Map", variant: "BUTTON_SOLID" },
    { label: "עיינו בנתונים", labelI18n: { he: "עיינו בנתונים", en: "Browse Data", pl: "Przeglądaj dane" }, url: "/data", icon: "Database", variant: "BUTTON_OUTLINE" },
  ],
  HERO_GRID: [
    { label: "מפות", labelI18n: { he: "מפות", en: "Maps", pl: "Mapy" }, url: "/maps", icon: "Map", variant: "CARD" },
    { label: "נתונים", labelI18n: { he: "נתונים", en: "Data", pl: "Dane" }, url: "/data", icon: "Database", variant: "CARD" },
    { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive", pl: "Archiwum" }, url: "/archive", icon: "BookOpen", variant: "CARD" },
    { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts", pl: "Artykuły" }, url: "/posts", icon: "FileText", variant: "CARD" },
  ],
  HERO_STRIP: [
    { label: "קהילות", labelI18n: { he: "קהילות", en: "Communities", pl: "Społeczności" }, url: "/categories/communities", icon: "Users" },
    { label: "היסטוריה", labelI18n: { he: "היסטוריה", en: "History", pl: "Historia" }, url: "/categories/history", icon: "Clock" },
    { label: "דמוגרפיה", labelI18n: { he: "דמוגרפיה", en: "Demographics", pl: "Demografia" }, url: "/categories/demographics", icon: "BarChart" },
  ],
  FOOTER: [
    { label: "מדיניות פרטיות", labelI18n: { he: "מדיניות פרטיות", en: "Privacy Policy", pl: "Polityka prywatności" }, url: "/privacy" },
    { label: "תנאי שימוש", labelI18n: { he: "תנאי שימוש", en: "Terms of Use", pl: "Warunki użytkowania" }, url: "/terms" },
    { label: "נגישות", labelI18n: { he: "נגישות", en: "Accessibility", pl: "Dostępność" }, url: "/accessibility" },
    { label: "צור קשר", labelI18n: { he: "צור קשר", en: "Contact", pl: "Kontakt" }, url: "/contact" },
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
      title: string;
      titleI18n: Prisma.InputJsonValue;
      items: FooterItemSeed[];
    }
  | {
      type: Extract<MenuType, "RICH_TEXT">;
      title: string;
      titleI18n: Prisma.InputJsonValue;
      content: string;
      contentI18n: Prisma.InputJsonValue;
    };

const FOOTER_COLUMNS: FooterColumnSeed[] = [
  {
    type: "LINK_LIST",
    title: "ניווט",
    titleI18n: { he: "ניווט", en: "Navigation", pl: "Nawigacja" },
    items: [
      { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts", pl: "Artykuły" }, url: "/posts" },
      { label: "מפות", labelI18n: { he: "מפות", en: "Maps", pl: "Mapy" }, url: "/maps" },
      { label: "נתונים", labelI18n: { he: "נתונים", en: "Data", pl: "Dane" }, url: "/data" },
      { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive", pl: "Archiwum" }, url: "/archive" },
    ],
  },
  {
    type: "LINK_LIST",
    title: "מידע",
    titleI18n: { he: "מידע", en: "Information", pl: "Informacje" },
    items: [
      { label: "אודות", labelI18n: { he: "אודות", en: "About", pl: "O nas" }, url: "/about" },
      { label: "צור קשר", labelI18n: { he: "צור קשר", en: "Contact", pl: "Kontakt" }, url: "/contact" },
      { label: "מדיניות פרטיות", labelI18n: { he: "מדיניות פרטיות", en: "Privacy Policy", pl: "Polityka prywatności" }, url: "/privacy" },
      { label: "תנאי שימוש", labelI18n: { he: "תנאי שימוש", en: "Terms of Use", pl: "Warunki użytkowania" }, url: "/terms" },
      { label: "נגישות", labelI18n: { he: "נגישות", en: "Accessibility", pl: "Dostępność" }, url: "/accessibility" },
    ],
  },
  {
    type: "RICH_TEXT",
    title: "אודות",
    titleI18n: { he: "אודות", en: "About", pl: "O nas" },
    content:
      "פרויקט קהילות יהודי מזרח אירופה הוא יוזמת מחקר המתעדת אלף שנות היסטוריה של קהילות יהודיות במזרח אירופה.",
    contentI18n: {
      he: "פרויקט קהילות יהודי מזרח אירופה הוא יוזמת מחקר המתעדת אלף שנות היסטוריה של קהילות יהודיות במזרח אירופה.",
      en: "The Eastern European Jewish Communities Project is a research initiative documenting 1000 years of history of Jewish communities in Eastern Europe.",
      pl: "Projekt Społeczności Żydowskich Europy Wschodniej to inicjatywa badawcza dokumentująca 1000 lat historii społeczności żydowskich w Europie Wschodniej.",
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
    title: "מנוע חיפוש קהילות",
    titleI18n: { he: "מנוע חיפוש קהילות", en: "Community Search Engine", pl: "Wyszukiwarka społeczności" },
    description: "חיפוש לפי שם, מחוז או גוברניה",
    descriptionI18n: { he: "חיפוש לפי שם, מחוז או גוברניה", en: "Search by name, district, or governorate", pl: "Szukaj według nazwy, powiatu lub guberni" },
    icon: "Globe",
    url: "/search",
  },
  {
    title: "כלי השוואת מפקדים",
    titleI18n: { he: "כלי השוואת מפקדים", en: "Census Comparison Tool", pl: "Narzędzie porównywania spisów" },
    description: "השוואת נתונים בין מפקדים שונים",
    descriptionI18n: { he: "השוואת נתונים בין מפקדים שונים", en: "Compare data across different censuses", pl: "Porównaj dane z różnych spisów" },
    icon: "Database",
    url: "/tools/census-compare",
  },
  {
    title: "ארכיון מסמכים דיגיטלי",
    titleI18n: { he: "ארכיון מסמכים דיגיטלי", en: "Digital Document Archive", pl: "Cyfrowe archiwum dokumentów" },
    description: "דפדוף בתעודות סרוקות",
    descriptionI18n: { he: "דפדוף בתעודות סרוקות", en: "Browse scanned documents", pl: "Przeglądaj zeskanowane dokumenty" },
    icon: "Scroll",
    url: "/archive",
  },
  {
    title: "מפה אינטראקטיבית",
    titleI18n: { he: "מפה אינטראקטיבית", en: "Interactive Map", pl: "Mapa interaktywna" },
    description: "צפייה בשכבות היסטוריות",
    descriptionI18n: { he: "צפייה בשכבות היסטוריות", en: "View historical layers", pl: "Przeglądaj warstwy historyczne" },
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
    const base = { type: col.type, order: i + 1, title: col.title, titleI18n: col.titleI18n };
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
        : { ...base, content: col.content, contentI18n: col.contentI18n };
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
