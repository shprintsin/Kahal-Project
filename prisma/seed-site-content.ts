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
    { label: { he: "בית", en: "Home" }, url: "/", icon: "Home" },
    { label: { he: "מפות ונתונים", en: "Maps & Data" }, url: "/data", icon: "Database" },
    { label: { he: "יצירת קשר", en: "Contact" }, url: "/contact", icon: "Mail" },
    { label: { he: "אודות", en: "About" }, url: "/about", icon: "Info" },
  ],
  HERO_ACTIONS: [
    { label: { he: "חפשו במפות", en: "Explore Maps" }, url: "/data", icon: "Map", variant: "BUTTON_SOLID" },
    { label: { he: "מה חדש", en: "What's New" }, url: "/posts/28-04-overview", icon: "ArrowLeft", variant: "BUTTON_OUTLINE" },
  ],
  HERO_GRID: [
    { label: { he: "מפות ונתונים", en: "Maps & Data" }, url: "/data", icon: "Database", variant: "CARD" },
    { label: { he: "שכבות", en: "Layers" }, url: "/layers", icon: "Layers", variant: "CARD" },
    { label: { he: "תעודות", en: "Documents" }, url: "/documents-v2", icon: "BookOpen", variant: "CARD" },
    { label: { he: "רשימות", en: "Posts" }, url: "/posts", icon: "FileText", variant: "CARD" },
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
      { label: { he: "רשימות", en: "Posts" }, url: "/posts" },
      { label: { he: "מפות ונתונים", en: "Maps & Data" }, url: "/data" },
      { label: { he: "שכבות", en: "Layers" }, url: "/layers" },
      { label: { he: "תעודות", en: "Documents" }, url: "/documents-v2" },
      { label: { he: "דוקומנטציה", en: "Documentation" }, url: "/docs" },
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
    title: { he: "בלוג מדעי השטעטל", en: "ShtetlAtlas Science Blog" },
    description: { he: "מאמרים ועדכונים על מחקר השטעטל", en: "Articles and updates on Shtetl research" },
    icon: "BookOpen",
    url: "https://blog.shtetlatlas.org/",
  },
];

// ---------------------------------------------------------------------------
// 5. Static pages (about, privacy, terms)
// ---------------------------------------------------------------------------

type PageSeed = {
  slug: string;
  title: I18n<string>;
  content: I18n<string>;
};

const STATIC_PAGES: PageSeed[] = [
  {
    slug: "about",
    title: { he: "אודות", en: "About" },
    content: {
      he: `## אודות הפרויקט

פרויקט קהילות יהודי מזרח אירופה (ShtetlAtlas) הוא מיזם מחקרי המתעד אלף שנות היסטוריה של קהילות יהודיות במזרח אירופה.

הפרויקט מרכז נתונים גיאוגרפיים, דמוגרפיים והיסטוריים ממקורות ארכיוניים מגוונים, ומנגיש אותם לציבור החוקרים והמתעניינים באמצעות מפות אינטראקטיביות, מערכי נתונים פתוחים וכלי ויזואליזציה.

## צוות המחקר

הפרויקט מתנהל במסגרת האוניברסיטה העברית בירושלים, בהובלת ד"ר יניי שפיצר ובסיוע שניאור שפרינצין.

## יצירת קשר

לשאלות, הצעות לשיתוף פעולה או דיווח על שגיאות, ניתן לפנות אלינו דרך [טופס יצירת הקשר](/he/contact).`,
      en: `## About the Project

The Eastern European Jewish Communities Project (ShtetlAtlas) is a research initiative documenting 1000 years of history of Jewish communities in Eastern Europe.

The project aggregates geographic, demographic, and historical data from diverse archival sources and makes them accessible to researchers and the public through interactive maps, open datasets, and visualization tools.

## Research Team

The project is conducted at The Hebrew University of Jerusalem, led by Dr. Yannay Spitzer with the assistance of Shneor Shprintsin.

## Contact

For questions, collaboration proposals, or error reports, please reach out via our [contact form](/en/contact).`,
    },
  },
  {
    slug: "privacy",
    title: { he: "מדיניות פרטיות", en: "Privacy Policy" },
    content: {
      he: `## מדיניות פרטיות

אתר ShtetlAtlas מכבד את פרטיות המשתמשים. מדיניות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על מידע אישי.

### מידע שאנו אוספים

אנו אוספים מידע מינימלי הנדרש לתפעול האתר, כולל נתוני שימוש אנונימיים לצורכי שיפור השירות. בעת יצירת קשר דרך הטופס, אנו שומרים את שמכם, כתובת הדוא"ל ותוכן ההודעה.

### שימוש במידע

המידע שנאסף משמש אך ורק לצורך מתן מענה לפניות, שיפור חוויית המשתמש ותחזוקת האתר. איננו מעבירים מידע אישי לצדדים שלישיים.

### עוגיות (Cookies)

האתר משתמש בעוגיות טכניות הנדרשות לתפעולו התקין. אין שימוש בעוגיות מעקב של צדדים שלישיים.

### יצירת קשר

לשאלות בנושא פרטיות, ניתן לפנות אלינו דרך [טופס יצירת הקשר](/he/contact).`,
      en: `## Privacy Policy

ShtetlAtlas respects user privacy. This policy explains how we collect, use, and protect personal information.

### Information We Collect

We collect minimal information required for site operation, including anonymous usage data for service improvement. When you contact us via the form, we store your name, email address, and message content.

### Use of Information

Collected information is used solely for responding to inquiries, improving user experience, and site maintenance. We do not share personal information with third parties.

### Cookies

The site uses technical cookies required for proper operation. No third-party tracking cookies are used.

### Contact

For privacy-related questions, please reach out via our [contact form](/en/contact).`,
    },
  },
  {
    slug: "terms",
    title: { he: "תנאי שימוש", en: "Terms of Use" },
    content: {
      he: `## תנאי שימוש

השימוש באתר ShtetlAtlas ובנתונים המפורסמים בו כפוף לתנאים הבאים.

### נתונים ומחקר

הנתונים והשכבות הגיאוגרפיות באתר הם חלק ממחקר פעיל ומסופקים כמות שהם (As-Is). הנתונים עשויים להשתנות, להתעדכן או להיות מתוקנים בכל עת.

### שימוש מותר

ניתן לצפות בנתונים ולהשתמש בהם למטרות לימוד אישי. לשימוש אקדמי, מחקרי או מסחרי נדרש אישור מראש מצוות המחקר.

### ציטוט

בכל שימוש בנתונים או התייחסות אליהם, יש לצטט את הפרויקט בהתאם לציטוט המומלץ המופיע באתר.

### זכויות יוצרים

כל הזכויות בנתונים, במפות ובתוכן האתר שמורות לצוות המחקר, אלא אם צוין אחרת.

### הגבלת אחריות

האתר והנתונים מסופקים ללא אחריות מכל סוג. צוות המחקר אינו אחראי לנזק שייגרם משימוש בנתונים.

### יצירת קשר

לשאלות בנושא תנאי השימוש, ניתן לפנות אלינו דרך [טופס יצירת הקשר](/he/contact).`,
      en: `## Terms of Use

Use of the ShtetlAtlas website and the data published on it is subject to the following terms.

### Data and Research

The data and geographic layers on the site are part of active research and are provided as-is. Data may change, be updated, or corrected at any time.

### Permitted Use

You may view and use the data for personal study purposes. Academic, research, or commercial use requires prior approval from the research team.

### Citation

Any use of or reference to the data must cite the project according to the recommended citation on the site.

### Copyright

All rights to the data, maps, and site content are reserved to the research team, unless otherwise noted.

### Limitation of Liability

The site and data are provided without warranty of any kind. The research team is not responsible for any damage caused by use of the data.

### Contact

For questions about the terms of use, please reach out via our [contact form](/en/contact).`,
    },
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

async function seedStaticPages(): Promise<void> {
  for (const page of STATIC_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      create: {
        slug: page.slug,
        title: page.title as Prisma.InputJsonValue,
        content: page.content as Prisma.InputJsonValue,
        status: "published",
        language: "HE",
      },
      update: {
        title: page.title as Prisma.InputJsonValue,
        content: page.content as Prisma.InputJsonValue,
        status: "published",
      },
    });
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
  await seedStaticPages();
  console.log(`  ✓ ${STATIC_PAGES.length} static pages (about, privacy, terms)`);
  console.log("Done.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
