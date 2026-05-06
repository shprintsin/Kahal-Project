import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const admin = await prisma.user.create({
    data: {
      email: "admin@kahal.org",
      name: "Admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        title: { he: "היסטוריה", en: "History" },
        slug: "history",
      },
    }),
    prisma.category.create({
      data: {
        title: { he: "דמוגרפיה", en: "Demographics" },
        slug: "demographics",
      },
    }),
    prisma.category.create({
      data: {
        title: { he: "מפות", en: "Maps" },
        slug: "maps-category",
      },
    }),
    prisma.category.create({
      data: {
        title: { he: "תרבות", en: "Culture" },
        slug: "culture",
      },
    }),
    prisma.category.create({
      data: {
        title: { he: "קהילות", en: "Communities" },
        slug: "communities",
      },
    }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: { he: "גליציה", en: "Galicia" }, slug: "galicia" } }),
    prisma.tag.create({ data: { name: { he: "קונגרס פולין", en: "Congress Poland" }, slug: "congress-poland" } }),
    prisma.tag.create({ data: { name: { he: "מפקד אוכלוסין", en: "Census" }, slug: "census" } }),
    prisma.tag.create({ data: { name: { he: "בתי כנסת", en: "Synagogues" }, slug: "synagogues" } }),
    prisma.tag.create({ data: { name: { he: "ארכיון", en: "Archive" }, slug: "archive" } }),
    prisma.tag.create({ data: { name: { he: "מאה 19", en: "19th Century" }, slug: "19th-century" } }),
  ]);

  const regions = await Promise.all([
    prisma.region.create({ data: { name: { he: "גליציה", en: "Galicia" }, slug: "galicia" } }),
    prisma.region.create({ data: { name: { he: "קונגרס פולין", en: "Congress Poland" }, slug: "congress-poland" } }),
    prisma.region.create({ data: { name: { he: "וולין", en: "Volhynia" }, slug: "volhynia" } }),
    prisma.region.create({ data: { name: { he: "ליטא", en: "Lithuania" }, slug: "lithuania" } }),
  ]);

  const periods = await Promise.all([
    prisma.period.create({ data: { name: { he: "שלטון אוסטרי", en: "Austrian Rule" }, slug: "austrian-rule", dateStart: new Date("1772-01-01"), dateEnd: new Date("1918-11-11") } }),
    prisma.period.create({ data: { name: { he: "שלטון רוסי", en: "Russian Rule" }, slug: "russian-rule", dateStart: new Date("1795-01-01"), dateEnd: new Date("1917-01-01") } }),
    prisma.period.create({ data: { name: { he: "בין המלחמות", en: "Interwar Period" }, slug: "interwar", dateStart: new Date("1918-11-11"), dateEnd: new Date("1939-09-01") } }),
  ]);

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: { he: "מפקד האוכלוסין של גליציה 1890", en: "The Galician Census of 1890" },
        slug: "galician-census-1890",
        content: {
          he: "מפקד האוכלוסין של 1890 בגליציה היה אחד המפקדים המקיפים ביותר שנערכו באימפריה האוסטרו-הונגרית.",
          en: "The 1890 census in Galicia was one of the most comprehensive censuses conducted in the Austro-Hungarian Empire. It included data on religion, language, occupation, and marital status.",
        },
        excerpt: { he: "סקירת מפקד האוכלוסין", en: "Overview of the Galician census" },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[1].id }] },
        tags: { create: [{ tag: { connect: { id: tags[0].id } } }, { tag: { connect: { id: tags[2].id } } }, { tag: { connect: { id: tags[5].id } } }] },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: { he: "בתי הכנסת של לבוב", en: "The Synagogues of Lviv" },
        slug: "synagogues-of-lviv",
        content: {
          he: "לבוב הייתה אחד ממרכזי החיים היהודיים החשובים ביותר בגליציה.",
          en: "Lviv was one of the most important centers of Jewish life in Galicia. The city had dozens of synagogues and study houses.",
        },
        excerpt: { he: "סיפורם של בתי הכנסת", en: "The story of Lviv's historic synagogues" },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[3].id }] },
        tags: { create: [{ tag: { connect: { id: tags[0].id } } }, { tag: { connect: { id: tags[3].id } } }] },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: { he: "גלויות היסטוריות מערי גליציה", en: "Historic Postcards from Galician Towns" },
        slug: "historic-postcards-galicia",
        content: {
          he: "אוסף גלויות היסטוריות מערי גליציה מספק הצצה מרתקת לחיי היומיום.",
          en: "A collection of historic postcards from Galician towns provides a fascinating glimpse into daily life of Jewish communities.",
        },
        excerpt: { he: "גלויות מימי האימפריה", en: "Postcards from the Austro-Hungarian era" },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[0].id }] },
        tags: { create: [{ tag: { connect: { id: tags[0].id } } }, { tag: { connect: { id: tags[4].id } } }, { tag: { connect: { id: tags[5].id } } }] },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: { he: "התיישבות יהודית בווהלין", en: "Jewish Settlement in Volhynia" },
        slug: "jewish-settlement-volhynia",
        content: {
          he: "ההתיישבות היהודית בווהלין מתוחה לימי הביניים.",
          en: "Jewish settlement in Volhynia dates back to the Middle Ages. The region was an important center for Hasidism.",
        },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[4].id }] },
        tags: { create: [{ tag: { connect: { id: tags[5].id } } }] },
        regions: { connect: [{ id: regions[2].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: { he: "מסחר יהודי בקראקוב", en: "Jewish Commerce in Krakow" },
        slug: "jewish-commerce-krakow",
        content: { he: "טיוטה של מאמר על המסחר היהודי בקראקוב." },
        status: "draft",
        authorId: admin.id,
        categories: { connect: [{ id: categories[0].id }] },
      },
    }),
  ]);

  const pages = await Promise.all([
    prisma.page.create({
      data: {
        title: { he: "אודות", en: "About" },
        slug: "about",
        content: {
          he: "# אודות הפרויקט\n\nפרויקט קהל הוא פלטפורמה מחקרית דיגיטלית.",
          en: "# About the Project\n\nThe Kahal Project is a digital research platform making historical materials about Jewish communities in Eastern Europe accessible.",
        },
        status: "published",
        authorId: admin.id,
        menuOrder: 1,
      },
    }),
    prisma.page.create({
      data: {
        title: { he: "צור קשר", en: "Contact" },
        slug: "contact",
        content: {
          he: "# צור קשר\n\nניתן ליצור איתנו קשר בכתובת: contact@kahal.org",
          en: "# Contact\n\nYou can reach us at: contact@kahal.org",
        },
        status: "published",
        authorId: admin.id,
        menuOrder: 2,
      },
    }),
    prisma.page.create({
      data: {
        title: { he: "מדיניות פרטיות", en: "Privacy Policy" },
        slug: "privacy",
        content: {
          he: "# מדיניות פרטיות\n\nאנו מכבדים את פרטיותכם ומתחייבים להגן על המידע האישי שלכם.",
        },
        status: "published",
        authorId: admin.id,
        menuOrder: 3,
        showInMenu: false,
      },
    }),
  ]);

  const datasets = await Promise.all([
    prisma.dataset.create({
      data: {
        title: { he: "מפקד אוכלוסין גליציה 1890", en: "Galicia Census 1890" },
        slug: "galicia-census-1890",
        description: {
          he: "נתוני מפקד האוכלוסין של גליציה משנת 1890",
          en: "Census data from Galicia 1890 including religion, language and occupation",
        },
        status: "published",
        maturity: "Validated",
        version: "2.1.0",
        license: "CC BY 4.0",
        yearMin: 1890,
        yearMax: 1890,
        categoryId: categories[1].id,
        citationText: { he: "Kahal Project, Galicia Census 1890 Dataset, v2.1.0" },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: { he: "רשימת יישובים יהודיים בקונגרס פולין", en: "Jewish Settlements in Congress Poland" },
        slug: "jewish-settlements-congress-poland",
        description: {
          he: "רשימה מקיפה של יישובים יהודיים",
          en: "Comprehensive list of Jewish settlements in Congress Poland in the 19th century",
        },
        status: "published",
        maturity: "Provisional",
        version: "1.0.0",
        license: "CC BY-SA 4.0",
        yearMin: 1800,
        yearMax: 1914,
        categoryId: categories[4].id,
        regions: { connect: [{ id: regions[1].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: { he: "בתי כנסת בגליציה", en: "Synagogues of Galicia Database" },
        slug: "synagogues-galicia-db",
        description: { he: "מאגר מידע על בתי כנסת היסטוריים בגליציה כולל מיקום, שנת בנייה ותיאור אדריכלי" },
        status: "published",
        maturity: "Preliminary",
        version: "0.9.0",
        yearMin: 1600,
        yearMax: 1939,
        categoryId: categories[3].id,
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: { he: 'נתוני שמות משפחה יהודיים', en: 'Jewish Surname Data' },
        slug: 'jewish-surname-data',
        description: {
          he: 'שמות משפחה יהודיים לפי אזור גאוגרפי ותקופה',
          en: 'Jewish surnames by geographic region and period',
        },
        status: 'published',
        maturity: 'Preliminary',
        version: '1.0.0',
        license: 'CC BY 4.0',
        yearMin: 1765,
        yearMax: 1914,
        categoryId: categories[1].id,
        regions: { connect: [{ id: regions[0].id }, { id: regions[1].id }] },
      },
    }),
  ]);

  const artifacts = await Promise.all([
    prisma.artifact.create({
      data: {
        title: { he: 'פנקס קהילת בראד, 1743', en: 'Brody Community Ledger, 1743' },
        slug: 'brody-community-ledger-1743',
        description: { he: 'פנקס קהילה מקורי', en: 'Original community ledger documenting Jewish life in Brody' },
        excerpt: { he: 'פנקס קהילה', en: 'Community ledger' },
        year: 1743,
        dateDisplay: '1743',
        artifactCategoryId: categories[0].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[4].id }, { id: tags[5].id }] },
      },
    }),
    prisma.artifact.create({
      data: {
        title: { he: 'תעודת מסע — לבוב, 1862', en: 'Travel Document — Lviv, 1862' },
        slug: 'travel-doc-lviv-1862',
        description: { he: 'תעודת מסע רשמית שהונפקה ליהודי מלבוב בשנת 1862' },
        excerpt: { he: 'תעודה רשמית' },
        year: 1862,
        dateDisplay: '1862',
        artifactCategoryId: categories[0].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[4].id }] },
      },
    }),
    prisma.artifact.create({
      data: {
        title: { he: 'רשימת נישואין — קראקוב, 1801', en: 'Marriage Registry — Krakow, 1801' },
        slug: 'marriage-registry-krakow-1801',
        description: { he: 'רישום אזרחי של נישואין יהודיים בקראקוב' },
        excerpt: { he: 'רישום אזרחי' },
        year: 1801,
        dateDisplay: '1801',
        artifactCategoryId: categories[0].id,
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.artifact.create({
      data: {
        title: { he: 'צוואת ר׳ אליעזר — טרנופול, 1789', en: "Rabbi Eliezer's Will — Ternopil, 1789" },
        slug: 'rabbi-eliezer-will-ternopil-1789',
        description: { he: 'צוואה אישית של רב מטרנופול המתעדת חיי קהילה ומנהגים' },
        excerpt: { he: 'מסמך אישי' },
        year: 1789,
        dateDisplay: '1789',
        artifactCategoryId: categories[3].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[5].id }] },
      },
    }),
  ]);

  const siteLinks = await Promise.all([
    prisma.siteLink.create({
      data: {
        title: { he: 'מנוע חיפוש קהילות', en: 'Community Search Engine' },
        description: { he: 'חיפוש לפי שם, מחוז או גוברניה', en: 'Search by name, district, or governorate' },
        icon: 'Globe',
        url: '/search',
        order: 1,
        status: 'published',
      },
    }),
    prisma.siteLink.create({
      data: {
        title: { he: 'כלי השוואת מפקדים', en: 'Census Comparison Tool' },
        description: { he: 'השוואת נתונים בין מפקדים שונים', en: 'Compare data across different censuses' },
        icon: 'Database',
        url: '/tools/census-compare',
        order: 2,
        status: 'published',
      },
    }),
    prisma.siteLink.create({
      data: {
        title: { he: 'ארכיון מסמכים דיגיטלי', en: 'Digital Document Archive' },
        description: { he: 'דפדוף בתעודות סרוקות', en: 'Browse scanned documents' },
        icon: 'Scroll',
        url: '/archive',
        order: 3,
        status: 'published',
      },
    }),
    prisma.siteLink.create({
      data: {
        title: { he: 'מפה אינטראקטיבית', en: 'Interactive Map' },
        description: { he: 'צפייה בשכבות היסטוריות', en: 'View historical layers' },
        icon: 'Map',
        url: '/maps',
        order: 4,
        status: 'published',
      },
    }),
  ]);

  const maps = await Promise.all([
    prisma.dataset.create({
      data: {
        title: { he: "יישובים יהודיים בגליציה 1890", en: "Jewish Settlements in Galicia 1890" },
        slug: "jewish-settlements-galicia-1890",
        description: {
          he: "מפת יישובים יהודיים בגליציה",
          en: "Map of Jewish settlements in Galicia based on 1890 census",
        },
        status: "published",
        year: 1890,
        yearMin: 1890,
        yearMax: 1890,
        period: "שלטון אוסטרי",
        config: { center: [49.85, 24.0], zoom: 7, maxZoom: 16, minZoom: 5 },
        categoryId: categories[2].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: { he: "בתי כנסת בגליציה", en: "Synagogues in Galicia" },
        slug: "synagogues-galicia-map",
        description: { he: "מפת בתי כנסת היסטוריים בגליציה" },
        status: "published",
        yearMin: 1600,
        yearMax: 1939,
        config: { center: [49.85, 24.0], zoom: 7 },
        categoryId: categories[2].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[3].id }] },
      },
    }),
  ]);

  const layers = await Promise.all([
    prisma.layer.create({
      data: {
        name: { he: "יישובים יהודיים 1890", en: "Jewish Settlements 1890" },
        slug: "jewish-settlements-1890",
        description: { he: "שכבת נקודות של יישובים יהודיים בגליציה על פי מפקד 1890" },
        status: "published",
        type: "POINTS",
        maturity: "Validated",
        sourceType: "database",
        minYear: 1890,
        maxYear: 1890,
        categoryId: categories[1].id,
        styleConfig: { color: "#3b82f6", radius: 5, fillOpacity: 0.8 },
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }] },
      },
    }),
    prisma.layer.create({
      data: {
        name: { he: "גבולות גליציה", en: "Galicia Borders" },
        slug: "galicia-borders",
        description: { he: "גבולות גליציה ולודומריה בתקופת השלטון האוסטרי" },
        status: "published",
        type: "POLYGONS",
        maturity: "Validated",
        sourceType: "inline",
        styleConfig: { color: "#ef4444", weight: 2, fillOpacity: 0.1 },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.layer.create({
      data: {
        name: { he: "בתי כנסת", en: "Synagogues" },
        slug: "synagogues-layer",
        description: { he: "מיקומי בתי כנסת היסטוריים בגליציה" },
        status: "published",
        type: "POINTS",
        maturity: "Preliminary",
        sourceType: "database",
        styleConfig: { color: "#f59e0b", radius: 6, fillOpacity: 0.9 },
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[3].id }] },
      },
    }),
  ]);

  await Promise.all([
    prisma.datasetLayerAssociation.create({
      data: { datasetId: maps[0].id, layerId: layers[0].id, zIndex: 2, isVisible: true, isVisibleByDefault: true },
    }),
    prisma.datasetLayerAssociation.create({
      data: { datasetId: maps[0].id, layerId: layers[1].id, zIndex: 1, isVisible: true, isVisibleByDefault: true },
    }),
    prisma.datasetLayerAssociation.create({
      data: { datasetId: maps[1].id, layerId: layers[2].id, zIndex: 2, isVisible: true, isVisibleByDefault: true },
    }),
    prisma.datasetLayerAssociation.create({
      data: { datasetId: maps[1].id, layerId: layers[1].id, zIndex: 1, isVisible: true, isVisibleByDefault: true },
    }),
  ]);

  const collection = await prisma.collection.create({
    data: {
      name: { he: "פנקסי קהילות גליציה", en: "Galician Community Records" },
      description: { he: "אוסף פנקסי קהילות מגליציה", en: "Collection of community records from Galicia" },
      yearMin: 1780,
      yearMax: 1914,
      regions: { connect: [{ id: regions[0].id }] },
      tags: { connect: [{ id: tags[4].id }] },
    },
  });

  const series1 = await prisma.series.create({
    data: {
      name: { he: "פנקסי קהילת לבוב", en: "Lviv Community Records" },
      slug: "lviv-community-records",
      description: { he: "פנקסי הקהילה היהודית של לבוב" },
      collectionId: collection.id,
      indexNumber: 1,
      yearMin: 1800,
      yearMax: 1890,
      languages: ["HE", "PL"],
      regions: { connect: [{ id: regions[0].id }] },
    },
  });

  const volume1 = await prisma.volume.create({
    data: {
      title: { he: "פנקס קהילת לבוב כרך א", en: "Lviv Community Record Vol. 1" },
      slug: "lviv-vol-1",
      description: { he: "כרך ראשון של פנקס קהילת לבוב, 1800-1830" },
      seriesId: series1.id,
      indexNumber: 1,
      year: 1800,
      yearMin: 1800,
      yearMax: 1830,
      languages: ["HE"],
      regions: { connect: [{ id: regions[0].id }] },
    },
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.volumePage.create({
      data: {
        volumeId: volume1.id,
        sequenceIndex: i,
        label: `עמוד ${i}`,
        isVisible: true,
      },
    });
  }

  const headerMenu = await prisma.menu.create({
    data: {
      location: "HEADER",
      items: {
        create: [
          { label: { he: "מאמרים", en: "Posts" }, url: "/posts", order: 1 },
          { label: { he: "מפות", en: "Maps" }, url: "/maps", order: 2 },
          { label: { he: "שכבות", en: "Layers" }, url: "/layers", order: 3 },
          { label: { he: "נתונים", en: "Data" }, url: "/data", order: 4 },
          { label: { he: "ארכיון", en: "Archive" }, url: "/archive", order: 5 },
          { label: { he: "אודות", en: "About" }, url: "/about", order: 6 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      location: "HERO_ACTIONS",
      items: {
        create: [
          { label: { he: "חפשו במפות", en: "Explore Maps" }, url: "/maps", icon: "Map", variant: "BUTTON_SOLID", order: 1 },
          { label: { he: "עיינו בנתונים", en: "Browse Data" }, url: "/data", icon: "Database", variant: "BUTTON_OUTLINE", order: 2 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      location: "HERO_GRID",
      items: {
        create: [
          { label: { he: "מפות", en: "Maps" }, url: "/maps", icon: "Map", variant: "CARD", order: 1 },
          { label: { he: "נתונים", en: "Data" }, url: "/data", icon: "Database", variant: "CARD", order: 2 },
          { label: { he: "ארכיון", en: "Archive" }, url: "/archive", icon: "BookOpen", variant: "CARD", order: 3 },
          { label: { he: "מאמרים", en: "Posts" }, url: "/posts", icon: "FileText", variant: "CARD", order: 4 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      location: "HERO_STRIP",
      items: {
        create: [
          { label: { he: "קהילות", en: "Communities" }, url: "/categories/communities", icon: "Users", order: 1 },
          { label: { he: "היסטוריה", en: "History" }, url: "/categories/history", icon: "Clock", order: 2 },
          { label: { he: "דמוגרפיה", en: "Demographics" }, url: "/categories/demographics", icon: "BarChart", order: 3 },
        ],
      },
    },
  });

  const footerCol1 = await prisma.footerColumn.create({
    data: {
      type: "LINK_LIST",
      order: 1,
      title: { he: "ניווט", en: "Navigation" },
      items: {
        create: [
          { label: { he: "מאמרים", en: "Posts" }, url: "/posts", order: 1 },
          { label: { he: "מפות", en: "Maps" }, url: "/maps", order: 2 },
          { label: { he: "נתונים", en: "Data" }, url: "/data", order: 3 },
        ],
      },
    },
  });

  await prisma.footerColumn.create({
    data: {
      type: "RICH_TEXT",
      order: 2,
      title: { he: "אודות", en: "About" },
      content: {
        he: "פרויקט קהל - פלטפורמה מחקרית להנגשת חומרים היסטוריים.",
        en: "The Kahal Project - a research platform for making historical materials accessible.",
      },
    },
  });

  await prisma.siteSettings.create({
    data: {
      key: "global",
      copyright: {
        he: "© 2026 פרויקט קהל. כל הזכויות שמורות.",
        en: "© 2026 Kahal Project. All rights reserved.",
      },
    },
  });

  // --- Documents ---
  const documents = await Promise.all([
    prisma.document.create({
      data: {
        slug: "regulamin-kahalu-lwow-1789",
        title: "Regulamin Kahału Lwowskiego z roku 1789",
        titleEn: "Regulations of the Lviv Kahal, 1789",
        description: "Regulamin wewnętrzny gminy żydowskiej we Lwowie, ustanowiony w 1789 roku przez starszych kahału. Dokument określa zasady administracji, podatków i sądownictwa kahałowego.",
        descriptionEn: "Internal regulations of the Jewish community in Lviv, established in 1789 by the kahal elders. The document defines rules for administration, taxation, and kahal judiciary.",
        category: "regulations",
        year: 1789,
        reference: "CDIAL, fond 52, op. 1, spr. 234",
        lang: "PL",
        status: "published",
        license: "Public Domain",
        volume: "I",
        pages: {
          create: [
            {
              index: 0,
              content: "# Regulamin Kahału Lwowskiego\n\n## Rozdział I — O wyborze starszych\n\n**Art. 1.** Starsi Kahału wybierani będą corocznie w miesiącu Nisan.",
              contentHe: "# תקנות קהל לבוב",
              contentEn: "# Regulations of the Lviv Kahal",
              filename: "001.md",
              bookmark: "Rozdział I — O wyborze starszych",
              highlights: [],
            },
          ],
        },
      },
    }),
    prisma.document.create({
      data: {
        slug: "pinkos-brody-1742",
        title: "פנקס הקהילה ברודי — רשימת משפחות תש\"ב",
        titleEn: "Brody Community Pinkas — Family Register, 1742",
        description: "רשימת המשפחות היהודיות בברודי משנת 1742, כפי שנרשמו בפנקס הקהילה.",
        descriptionEn: "Registry of Jewish families in Brody from 1742, as recorded in the community pinkas.",
        category: "pinkas",
        year: 1742,
        reference: "AGAD, Archiwum Brodzkie, sygn. 45",
        lang: "HE",
        status: "published",
        license: "Public Domain",
        pages: {
          create: [
            {
              index: 0,
              content: "Rejestr familii żydowskich miasta Brody, roku 1742.",
              contentHe: "# פנקס משפחות יהודי ברודי — תק\"ב",
              contentEn: "# Brody Jewish Family Register — 1742",
              filename: "001.md",
              bookmark: "רשימת משפחות — דף א׳",
              highlights: [],
            },
          ],
        },
      },
    }),
  ]);

  console.log("Seed complete!");
  console.log(`  Admin: admin@kahal.org / admin123`);
  console.log(`  ${categories.length} categories`);
  console.log(`  ${tags.length} tags`);
  console.log(`  ${regions.length} regions`);
  console.log(`  ${periods.length} periods`);
  console.log(`  ${posts.length} posts`);
  console.log(`  ${pages.length} pages`);
  console.log(`  ${datasets.length} datasets`);
  console.log(`  ${maps.length} maps`);
  console.log(`  ${layers.length} layers`);
  console.log(`  ${artifacts.length} artifacts`);
  console.log(`  ${siteLinks.length} site links`);
  console.log(`  ${documents.length} documents`);
  console.log(`  1 collection, 1 series, 1 volume, 5 pages`);
  console.log(`  4 menus (header, hero_actions, hero_grid, hero_strip)`);
  console.log(`  2 footer columns`);
  void headerMenu;
  void footerCol1;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
