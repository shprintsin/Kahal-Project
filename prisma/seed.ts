import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@kahal.dev" },
    update: {},
    create: {
      email: "admin@kahal.dev",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin user: ${admin.email}`);

  const categories = await Promise.all(
    [
      { title: "History", slug: "history", titleI18n: { he: "היסטוריה", en: "History" } },
      { title: "Demography", slug: "demography", titleI18n: { he: "דמוגרפיה", en: "Demography" } },
      { title: "Economy", slug: "economy", titleI18n: { he: "כלכלה", en: "Economy" } },
      { title: "Culture", slug: "culture", titleI18n: { he: "תרבות", en: "Culture" } },
    ].map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  console.log(`Categories: ${categories.length}`);

  const regions = await Promise.all(
    [
      { slug: "galicia", name: "Galicia", nameI18n: { he: "גליציה", en: "Galicia" } },
      { slug: "congress-poland", name: "Congress Poland", nameI18n: { he: "פולין הקונגרסאית", en: "Congress Poland" } },
      { slug: "volhynia", name: "Volhynia", nameI18n: { he: "וולין", en: "Volhynia" } },
      { slug: "lithuania", name: "Lithuania", nameI18n: { he: "ליטא", en: "Lithuania" } },
    ].map((r) =>
      prisma.region.upsert({
        where: { slug: r.slug },
        update: {},
        create: r,
      })
    )
  );
  console.log(`Regions: ${regions.length}`);

  const tags = await Promise.all(
    [
      { slug: "census", name: "Census", nameI18n: { he: "מפקד", en: "Census" } },
      { slug: "trade", name: "Trade", nameI18n: { he: "מסחר", en: "Trade" } },
      { slug: "communal-records", name: "Communal Records", nameI18n: { he: "רשומות קהילה", en: "Communal Records" } },
    ].map((t) =>
      prisma.tag.upsert({
        where: { slug: t.slug },
        update: {},
        create: t,
      })
    )
  );
  console.log(`Tags: ${tags.length}`);

  const post = await prisma.post.upsert({
    where: { slug: "welcome-to-kahal" },
    update: {},
    create: {
      title: "ברוכים הבאים לקהל",
      slug: "welcome-to-kahal",
      content: "# ברוכים הבאים\n\nאתר זה מרכז מידע על קהילות יהודיות במזרח אירופה.\n\nהאתר כולל מפות, מסמכים, ונתונים דמוגרפיים וכלכליים.",
      excerpt: "אתר מחקר לקהילות יהודיות במזרח אירופה",
      status: "published",
      language: "HE",
      authorId: admin.id,
      categories: { connect: [{ id: categories[0].id }] },
      regions: { connect: [{ id: regions[0].id }] },
    },
  });
  console.log(`Post: ${post.slug}`);

  const page = await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "אודות הפרויקט",
      slug: "about",
      content: "# אודות\n\nפרויקט קהל הוא מאגר דיגיטלי לחקר קהילות יהודיות במזרח אירופה.",
      excerpt: "אודות פרויקט קהל",
      status: "published",
      language: "HE",
      authorId: admin.id,
    },
  });
  console.log(`Page: ${page.slug}`);

  const sampleGeoJson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [21.012, 52.229] },
        properties: { name: "Warsaw", jewishPop: 337000, year: 1939 },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [23.795, 49.842] },
        properties: { name: "Lviv", jewishPop: 110000, year: 1939 },
      },
      {
        type: "Feature",
        geometry: { type: "Point", coordinates: [19.945, 50.064] },
        properties: { name: "Kraków", jewishPop: 56000, year: 1939 },
      },
    ],
  };

  const layer = await prisma.layer.upsert({
    where: { slug: "sample-jewish-communities" },
    update: {},
    create: {
      slug: "sample-jewish-communities",
      name: "Sample Jewish Communities",
      nameI18n: { he: "קהילות יהודיות לדוגמה", en: "Sample Jewish Communities" },
      description: "Sample layer showing major Jewish communities in 1939",
      status: "published",
      type: "POINTS",
      sourceType: "database",
      geoJsonData: sampleGeoJson,
      styleConfig: {
        type: "point",
        radius: 8,
        fillColor: "#1a472a",
        fillOpacity: 0.8,
        color: "#ffffff",
        weight: 2,
      },
      categoryId: categories[1].id,
      regions: { connect: [{ id: regions[0].id }, { id: regions[1].id }] },
    },
  });
  console.log(`Layer: ${layer.slug}`);

  const map = await prisma.map.upsert({
    where: { slug: "sample-communities-map" },
    update: {},
    create: {
      slug: "sample-communities-map",
      title: "מפת קהילות לדוגמה",
      titleI18n: { he: "מפת קהילות לדוגמה", en: "Sample Communities Map" },
      description: "Sample map showing Jewish communities in Eastern Europe",
      status: "published",
      year: 1939,
      config: {
        zoom: 6,
        center: [51.0, 22.0],
        tile: {
          src: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          maxZoom: 18,
          attribution: "© OpenStreetMap contributors",
        },
      },
      categoryId: categories[1].id,
      layers: {
        create: {
          layerId: layer.id,
          zIndex: 1,
          isVisible: true,
          isVisibleByDefault: true,
        },
      },
    },
  });
  console.log(`Map: ${map.slug}`);

  const headerMenu = await prisma.menu.upsert({
    where: { location: "HEADER" },
    update: {},
    create: {
      location: "HEADER",
      items: {
        create: [
          { label: "מפות", labelI18n: { he: "מפות", en: "Maps" }, url: "/maps", order: 0 },
          { label: "שכבות", labelI18n: { he: "שכבות", en: "Layers" }, url: "/layers", order: 1 },
          { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive" }, url: "/collections", order: 2 },
          { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts" }, url: "/posts", order: 3 },
          { label: "אודות", labelI18n: { he: "אודות", en: "About" }, url: "/about", order: 4 },
        ],
      },
    },
  });
  console.log(`Header menu: ${headerMenu.id}`);

  const heroMenu = await prisma.menu.upsert({
    where: { location: "HERO_GRID" },
    update: {},
    create: {
      location: "HERO_GRID",
      items: {
        create: [
          { label: "מפות", labelI18n: { he: "מפות", en: "Maps" }, url: "/maps", order: 0, icon: "Map", variant: "CARD" },
          { label: "שכבות נתונים", labelI18n: { he: "שכבות נתונים", en: "Data Layers" }, url: "/layers", order: 1, icon: "Layers", variant: "CARD" },
          { label: "מסמכים", labelI18n: { he: "מסמכים", en: "Documents" }, url: "/documents", order: 2, icon: "FileText", variant: "CARD" },
          { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive" }, url: "/collections", order: 3, icon: "Archive", variant: "CARD" },
        ],
      },
    },
  });
  console.log(`Hero menu: ${heroMenu.id}`);

  console.log("\nSeed complete!");
  console.log("Admin login: admin@kahal.dev / admin123");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
