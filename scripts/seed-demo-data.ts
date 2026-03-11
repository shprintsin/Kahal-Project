/**
 * Seed demo data via the CMS API
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts
 *
 * Set CMS_API_KEY env var or run with active session.
 * Defaults to http://localhost:3000/api/cms
 */

const BASE_URL = process.env.CMS_URL || "http://localhost:3000";
const API_KEY = process.env.CMS_API_KEY || "";

async function cms(action: string, data?: any) {
  const res = await fetch(`${BASE_URL}/api/cms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY && { "x-api-key": API_KEY }),
    },
    body: JSON.stringify({ action, data }),
  });

  const json = await res.json();
  if (!json.ok) {
    console.error(`FAILED [${action}]:`, json.error);
    return null;
  }
  console.log(`OK [${action}]`);
  return json.result;
}

async function seedCategories() {
  console.log("\n=== Seeding Categories ===");
  const categories = [
    { title: "היסטוריה", slug: "history", titleI18n: { en: "History", yi: "היסטאריע" } },
    { title: "מפות", slug: "maps", titleI18n: { en: "Maps", yi: "מאַפּעס" } },
    { title: "מסמכים", slug: "documents", titleI18n: { en: "Documents", yi: "דאָקומענטן" } },
    { title: "קהילות", slug: "communities", titleI18n: { en: "Communities", yi: "קהילות" } },
    { title: "מחקר", slug: "research", titleI18n: { en: "Research", yi: "פאָרשונג" } },
  ];

  const created: any[] = [];
  for (const cat of categories) {
    const result = await cms("categories.create", cat);
    if (result) created.push(result);
  }
  return created;
}

async function seedTags() {
  console.log("\n=== Seeding Tags ===");
  const tags = [
    { slug: "galicia", nameI18n: { he: "גליציה", en: "Galicia" } },
    { slug: "congress-poland", nameI18n: { he: "פולין הקונגרסאית", en: "Congress Poland" } },
    { slug: "volhynia", nameI18n: { he: "ווהלין", en: "Volhynia" } },
    { slug: "podolia", nameI18n: { he: "פודוליה", en: "Podolia" } },
    { slug: "19th-century", nameI18n: { he: "המאה ה-19", en: "19th Century" } },
    { slug: "demographics", nameI18n: { he: "דמוגרפיה", en: "Demographics" } },
    { slug: "synagogues", nameI18n: { he: "בתי כנסת", en: "Synagogues" } },
    { slug: "kehillot", nameI18n: { he: "קהילות", en: "Kehillot" } },
  ];

  const created: any[] = [];
  for (const tag of tags) {
    const result = await cms("tags.create", tag);
    if (result) created.push(result);
  }
  return created;
}

async function seedHeaderMenu() {
  console.log("\n=== Seeding Header Menu ===");
  return cms("menus.upsert", {
    location: "HEADER",
    items: [
      {
        label: { default: "דף הבית", translations: { en: "Home" } },
        icon: "FaHome",
        url: "/",
        order: 0,
        children: [],
      },
      {
        label: { default: "מפות", translations: { en: "Maps" } },
        icon: "FaMap",
        url: "/maps",
        order: 1,
        children: [
          {
            label: { default: "כל המפות", translations: { en: "All Maps" } },
            url: "/maps",
            order: 0,
            children: [],
          },
          {
            label: { default: "שכבות מידע", translations: { en: "Layers" } },
            url: "/layers",
            order: 1,
            children: [],
          },
        ],
      },
      {
        label: { default: "מאגר הנתונים", translations: { en: "Data Repository" } },
        icon: "FaDatabase",
        url: "/data",
        order: 2,
        children: [],
      },
      {
        label: { default: "מאמרים", translations: { en: "Articles" } },
        icon: "FaNewspaper",
        url: "/posts",
        order: 3,
        children: [],
      },
      {
        label: { default: "ארכיון", translations: { en: "Archive" } },
        icon: "FaArchive",
        url: "/archive",
        order: 4,
        children: [],
      },
      {
        label: { default: "אודות", translations: { en: "About" } },
        icon: "FaInfoCircle",
        url: "/about",
        order: 5,
        children: [],
      },
    ],
  });
}

async function seedHeroGrid() {
  console.log("\n=== Seeding Hero Grid ===");
  return cms("menus.upsert", {
    location: "HERO_GRID",
    items: [
      {
        label: { default: "מפות אינטראקטיביות", translations: { en: "Interactive Maps" } },
        icon: "FaMap",
        url: "/maps",
        order: 0,
        children: [],
      },
      {
        label: { default: "מאגרי מידע", translations: { en: "Data Repositories" } },
        icon: "FaDatabase",
        url: "/data",
        order: 1,
        children: [],
      },
      {
        label: { default: "מסמכים היסטוריים", translations: { en: "Historical Documents" } },
        icon: "FaScroll",
        url: "/archive",
        order: 2,
        children: [],
      },
      {
        label: { default: "קהילות יהודיות", translations: { en: "Jewish Communities" } },
        icon: "FaStar",
        url: "/layers",
        order: 3,
        children: [],
      },
      {
        label: { default: "מאמרים ומחקרים", translations: { en: "Articles & Research" } },
        icon: "FaBook",
        url: "/posts",
        order: 4,
        children: [],
      },
      {
        label: { default: "חיפוש", translations: { en: "Search" } },
        icon: "FaSearch",
        url: "/search",
        order: 5,
        children: [],
      },
    ],
  });
}

async function seedHeroActions() {
  console.log("\n=== Seeding Hero Actions ===");
  return cms("menus.upsert", {
    location: "HERO_ACTIONS",
    items: [
      {
        label: { default: "חקור את המפה", translations: { en: "Explore the Map" } },
        icon: "FaGlobeAmericas",
        url: "/maps",
        order: 0,
        children: [],
      },
      {
        label: { default: "עיין במאגר הנתונים", translations: { en: "Browse Data Repository" } },
        icon: "FaChartBar",
        url: "/data",
        order: 1,
        children: [],
      },
    ],
  });
}

async function seedHeroStrip() {
  console.log("\n=== Seeding Hero Strip ===");
  return cms("menus.upsert", {
    location: "HERO_STRIP",
    items: [
      {
        label: { default: "3,200+ קהילות ממופות", translations: { en: "3,200+ Mapped Communities" } },
        icon: "FaMapMarkerAlt",
        url: "#",
        order: 0,
        children: [],
      },
      {
        label: { default: "150+ מפות היסטוריות", translations: { en: "150+ Historical Maps" } },
        icon: "FaLayerGroup",
        url: "/maps",
        order: 1,
        children: [],
      },
      {
        label: { default: "50+ מאגרי נתונים", translations: { en: "50+ Datasets" } },
        icon: "FaDatabase",
        url: "/data",
        order: 2,
        children: [],
      },
      {
        label: { default: "קוד פתוח", translations: { en: "Open Source" } },
        icon: "FaCode",
        url: "https://github.com",
        order: 3,
        children: [],
      },
    ],
  });
}

async function seedFooterColumns() {
  console.log("\n=== Seeding Footer Columns ===");

  await cms("footer.create", {
    type: "LINK_LIST",
    order: 0,
    title: { default: "ניווט", translations: { en: "Navigation" } },
    items: [
      { label: { default: "דף הבית", translations: { en: "Home" } }, url: "/", order: 0 },
      { label: { default: "מפות", translations: { en: "Maps" } }, url: "/maps", order: 1 },
      { label: { default: "מאגר נתונים", translations: { en: "Data" } }, url: "/data", order: 2 },
      { label: { default: "מאמרים", translations: { en: "Articles" } }, url: "/posts", order: 3 },
      { label: { default: "ארכיון", translations: { en: "Archive" } }, url: "/archive", order: 4 },
    ],
  });

  await cms("footer.create", {
    type: "LINK_LIST",
    order: 1,
    title: { default: "משאבים", translations: { en: "Resources" } },
    items: [
      { label: { default: "שכבות מידע", translations: { en: "Data Layers" } }, url: "/layers", order: 0 },
      { label: { default: "קטגוריות", translations: { en: "Categories" } }, url: "/categories", order: 1 },
      { label: { default: "חיפוש", translations: { en: "Search" } }, url: "/search", order: 2 },
    ],
  });

  await cms("footer.create", {
    type: "RICH_TEXT",
    order: 2,
    title: { default: "אודות הפרויקט", translations: { en: "About the Project" } },
    content: {
      default: "<p>פרויקט הקהל הוא פלטפורמה דיגיטלית לחקר ההיסטוריה של קהילות יהודיות במזרח אירופה. הפרויקט משלב מפות אינטראקטיביות, מאגרי נתונים ומסמכים היסטוריים.</p>",
      translations: {
        en: "<p>The Kahal Project is a digital platform for studying the history of Jewish communities in Eastern Europe. The project combines interactive maps, data repositories, and historical documents.</p>",
      },
    },
  });

  await cms("footer.create", {
    type: "LINK_LIST",
    order: 3,
    title: { default: "צור קשר", translations: { en: "Contact" } },
    items: [
      { label: { default: "דוא\"ל", translations: { en: "Email" } }, url: "mailto:info@kahal-project.org", icon: "FaEnvelope", order: 0 },
      { label: { default: "GitHub", translations: { en: "GitHub" } }, url: "https://github.com", icon: "FaGithub", order: 1 },
    ],
  });
}

async function seedCopyrightText() {
  console.log("\n=== Seeding Copyright Text ===");
  return cms("settings.update", {
    copyrightText: {
      default: "© 2024 פרויקט הקהל. כל הזכויות שמורות.",
      translations: {
        en: "© 2024 The Kahal Project. All rights reserved.",
      },
    },
  });
}

async function seedPosts(categories: any[], tags: any[]) {
  console.log("\n=== Seeding Posts ===");

  const historyCategory = categories.find((c: any) => c.slug === "history");
  const communitiesCategory = categories.find((c: any) => c.slug === "communities");
  const researchCategory = categories.find((c: any) => c.slug === "research");

  const galiciaTag = tags.find((t: any) => t.slug === "galicia");
  const demographicsTag = tags.find((t: any) => t.slug === "demographics");
  const kehillotTag = tags.find((t: any) => t.slug === "kehillot");

  const posts = [
    {
      title: "הקהילות היהודיות בגליציה: סקירה היסטורית",
      slug: "jewish-communities-galicia-overview",
      excerpt: "סקירה מקיפה של ההיסטוריה של הקהילות היהודיות בגליציה מהמאה ה-16 ועד תקופת השואה. כולל ניתוח דמוגרפי ותיאור המוסדות הקהילתיים.",
      status: "published",
      language: "he",
      category_id: historyCategory?.id,
      tagIds: [galiciaTag?.id, kehillotTag?.id].filter(Boolean),
    },
    {
      title: "מגמות דמוגרפיות באוכלוסייה היהודית במזרח אירופה",
      slug: "demographic-trends-eastern-europe",
      excerpt: "ניתוח נתוני מפקד האוכלוסין ומקורות היסטוריים נוספים לשם מיפוי המגמות הדמוגרפיות של האוכלוסייה היהודית בין השנים 1800-1939.",
      status: "published",
      language: "he",
      category_id: researchCategory?.id,
      tagIds: [demographicsTag?.id].filter(Boolean),
    },
    {
      title: "בתי הכנסת של ווהלין: ארכיטקטורה ומורשת",
      slug: "volhynia-synagogues-architecture",
      excerpt: "מחקר על בתי הכנסת ההיסטוריים באזור ווהלין, כולל תיעוד אדריכלי ותצלומים היסטוריים מתקופת טרום השואה.",
      status: "published",
      language: "he",
      category_id: communitiesCategory?.id,
      tagIds: tags.filter((t: any) => ["volhynia", "synagogues"].includes(t.slug)).map((t: any) => t.id),
    },
    {
      title: "מקורות ראשוניים לחקר קהילות יהודיות בפולין",
      slug: "primary-sources-jewish-communities-poland",
      excerpt: "מדריך למקורות ראשוניים הזמינים לחוקרים המעוניינים בחקר הקהילות היהודיות בפולין הקונגרסאית ובגליציה.",
      status: "published",
      language: "he",
      category_id: researchCategory?.id,
      tagIds: tags.filter((t: any) => ["congress-poland", "galicia"].includes(t.slug)).map((t: any) => t.id),
    },
  ];

  for (const post of posts) {
    await cms("posts.create", post);
  }
}

async function seedDatasets(categories: any[]) {
  console.log("\n=== Seeding Datasets ===");
  const researchCategory = categories.find((c: any) => c.slug === "research");

  const datasets = [
    {
      title: "מפקד האוכלוסין של גליציה 1890",
      slug: "galicia-census-1890",
      description: "נתוני מפקד האוכלוסין של גליציה משנת 1890, כולל פילוח לפי דת, שפה ומקצוע.",
      status: "published",
      categoryId: researchCategory?.id,
      license: "CC-BY-4.0",
    },
    {
      title: "רשימת בתי כנסת בפולין - 1939",
      slug: "poland-synagogues-1939",
      description: "רשימה מקיפה של בתי כנסת שהיו קיימים בפולין ערב מלחמת העולם השנייה.",
      status: "published",
      license: "CC-BY-SA-4.0",
    },
    {
      title: "נתוני קהילות יהודיות בווהלין",
      slug: "volhynia-jewish-communities",
      description: "מאגר נתונים על קהילות יהודיות באזור ווהלין, כולל נתוני אוכלוסייה ומוסדות קהילתיים.",
      status: "published",
      license: "CC-BY-4.0",
    },
  ];

  for (const ds of datasets) {
    await cms("datasets.create", ds);
  }
}

async function seedMaps() {
  console.log("\n=== Seeding Maps ===");
  const maps = [
    {
      title: "קהילות יהודיות בגליציה - 1880",
      slug: "galicia-jewish-communities-1880",
      description: "מפה אינטראקטיבית המציגה את הקהילות היהודיות בגליציה בשנת 1880.",
      status: "published",
      year: 1880,
      center: { lat: 49.5, lng: 24.0 },
      zoom: 7,
    },
    {
      title: "בתי כנסת בפולין - לפני 1939",
      slug: "poland-synagogues-pre-1939",
      description: "מיפוי של בתי כנסת ידועים שהיו קיימים בפולין לפני מלחמת העולם השנייה.",
      status: "published",
      year: 1939,
      center: { lat: 51.9, lng: 19.1 },
      zoom: 6,
    },
  ];

  for (const map of maps) {
    await cms("maps.create", map);
  }
}

async function seedRegions() {
  console.log("\n=== Seeding Regions ===");
  const regions = [
    { name: "גליציה", slug: "galicia", nameI18n: { en: "Galicia", yi: "גאַליציע" } },
    { name: "ווהלין", slug: "volhynia", nameI18n: { en: "Volhynia", yi: "וואָלין" } },
    { name: "פודוליה", slug: "podolia", nameI18n: { en: "Podolia", yi: "פּאָדאָליע" } },
    { name: "פולין הקונגרסאית", slug: "congress-poland", nameI18n: { en: "Congress Poland" } },
    { name: "ליטא", slug: "lithuania", nameI18n: { en: "Lithuania", yi: "ליטע" } },
    { name: "בסרביה", slug: "bessarabia", nameI18n: { en: "Bessarabia" } },
  ];

  for (const region of regions) {
    await cms("regions.create", region);
  }
}

async function main() {
  console.log("=== Kahal CMS Demo Data Seeder ===");
  console.log(`Target: ${BASE_URL}/api/cms`);
  console.log("");

  const categories = await seedCategories();
  const tags = await seedTags();

  await seedHeaderMenu();
  await seedHeroGrid();
  await seedHeroActions();
  await seedHeroStrip();
  await seedFooterColumns();
  await seedCopyrightText();

  await seedPosts(categories, tags);
  await seedDatasets(categories);
  await seedMaps();
  await seedRegions();

  console.log("\n=== Seeding Complete ===");
}

main().catch(console.error);
