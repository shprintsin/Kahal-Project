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
        title: "היסטוריה",
        slug: "history",
        titleI18n: { he: "היסטוריה", en: "History", pl: "Historia" },
      },
    }),
    prisma.category.create({
      data: {
        title: "דמוגרפיה",
        slug: "demographics",
        titleI18n: { he: "דמוגרפיה", en: "Demographics", pl: "Demografia" },
      },
    }),
    prisma.category.create({
      data: {
        title: "מפות",
        slug: "maps-category",
        titleI18n: { he: "מפות", en: "Maps", pl: "Mapy" },
      },
    }),
    prisma.category.create({
      data: {
        title: "תרבות",
        slug: "culture",
        titleI18n: { he: "תרבות", en: "Culture", pl: "Kultura" },
      },
    }),
    prisma.category.create({
      data: {
        title: "קהילות",
        slug: "communities",
        titleI18n: { he: "קהילות", en: "Communities", pl: "Społeczności" },
      },
    }),
  ]);

  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "גליציה", slug: "galicia", nameI18n: { he: "גליציה", en: "Galicia", pl: "Galicja" } } }),
    prisma.tag.create({ data: { name: "קונגרס פולין", slug: "congress-poland", nameI18n: { he: "קונגרס פולין", en: "Congress Poland", pl: "Kongresówka" } } }),
    prisma.tag.create({ data: { name: "מפקד אוכלוסין", slug: "census", nameI18n: { he: "מפקד אוכלוסין", en: "Census", pl: "Spis ludności" } } }),
    prisma.tag.create({ data: { name: "בתי כנסת", slug: "synagogues", nameI18n: { he: "בתי כנסת", en: "Synagogues", pl: "Synagogi" } } }),
    prisma.tag.create({ data: { name: "ארכיון", slug: "archive", nameI18n: { he: "ארכיון", en: "Archive", pl: "Archiwum" } } }),
    prisma.tag.create({ data: { name: "מאה 19", slug: "19th-century", nameI18n: { he: "מאה 19", en: "19th Century", pl: "XIX wiek" } } }),
  ]);

  const regions = await Promise.all([
    prisma.region.create({ data: { name: "גליציה", slug: "galicia", nameI18n: { he: "גליציה", en: "Galicia", pl: "Galicja" } } }),
    prisma.region.create({ data: { name: "קונגרס פולין", slug: "congress-poland", nameI18n: { he: "קונגרס פולין", en: "Congress Poland", pl: "Kongresówka" } } }),
    prisma.region.create({ data: { name: "וולין", slug: "volhynia", nameI18n: { he: "וולין", en: "Volhynia", pl: "Wołyń" } } }),
    prisma.region.create({ data: { name: "ליטא", slug: "lithuania", nameI18n: { he: "ליטא", en: "Lithuania", pl: "Litwa" } } }),
  ]);

  const periods = await Promise.all([
    prisma.period.create({ data: { name: "שלטון אוסטרי", slug: "austrian-rule", nameI18n: { he: "שלטון אוסטרי", en: "Austrian Rule", pl: "Panowanie austriackie" }, dateStart: new Date("1772-01-01"), dateEnd: new Date("1918-11-11") } }),
    prisma.period.create({ data: { name: "שלטון רוסי", slug: "russian-rule", nameI18n: { he: "שלטון רוסי", en: "Russian Rule", pl: "Panowanie rosyjskie" }, dateStart: new Date("1795-01-01"), dateEnd: new Date("1917-01-01") } }),
    prisma.period.create({ data: { name: "בין המלחמות", slug: "interwar", nameI18n: { he: "בין המלחמות", en: "Interwar Period", pl: "Okres międzywojenny" }, dateStart: new Date("1918-11-11"), dateEnd: new Date("1939-09-01") } }),
  ]);

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "מפקד האוכלוסין של גליציה 1890",
        titleI18n: { he: "מפקד האוכלוסין של גליציה 1890", en: "The Galician Census of 1890", pl: "Spis ludności Galicji 1890" },
        slug: "galician-census-1890",
        content: "מפקד האוכלוסין של 1890 בגליציה היה אחד המפקדים המקיפים ביותר שנערכו באימפריה האוסטרו-הונגרית. המפקד כלל נתונים על דת, שפה, מקצוע ומצב משפחתי של התושבים.",
        contentI18n: {
          he: "מפקד האוכלוסין של 1890 בגליציה היה אחד המפקדים המקיפים ביותר שנערכו באימפריה האוסטרו-הונגרית.",
          en: "The 1890 census in Galicia was one of the most comprehensive censuses conducted in the Austro-Hungarian Empire. It included data on religion, language, occupation, and marital status.",
          pl: "Spis ludności z 1890 roku w Galicji był jednym z najbardziej kompleksowych spisów przeprowadzonych w Austro-Węgrzech.",
        },
        excerpt: "סקירת מפקד האוכלוסין של גליציה משנת 1890",
        excerptI18n: { he: "סקירת מפקד האוכלוסין", en: "Overview of the Galician census", pl: "Przegląd spisu ludności" },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[1].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[2].id }, { id: tags[5].id }] },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: "בתי הכנסת של לבוב",
        titleI18n: { he: "בתי הכנסת של לבוב", en: "The Synagogues of Lviv", pl: "Synagogi Lwowa" },
        slug: "synagogues-of-lviv",
        content: "לבוב הייתה אחד ממרכזי החיים היהודיים החשובים ביותר בגליציה. בעיר פעלו עשרות בתי כנסת ובתי מדרש, מהגדולים והמפוארים ועד לשטיבלך קטנים.",
        contentI18n: {
          he: "לבוב הייתה אחד ממרכזי החיים היהודיים החשובים ביותר בגליציה.",
          en: "Lviv was one of the most important centers of Jewish life in Galicia. The city had dozens of synagogues and study houses.",
          pl: "Lwów był jednym z najważniejszych ośrodków życia żydowskiego w Galicji.",
        },
        excerpt: "סיפורם של בתי הכנסת ההיסטוריים בלבוב",
        excerptI18n: { he: "סיפורם של בתי הכנסת", en: "The story of Lviv's historic synagogues", pl: "Historia synagog Lwowa" },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[3].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[3].id }] },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: "גלויות היסטוריות מערי גליציה",
        titleI18n: { he: "גלויות היסטוריות מערי גליציה", en: "Historic Postcards from Galician Towns", pl: "Historyczne pocztówki z miast galicyjskich" },
        slug: "historic-postcards-galicia",
        content: "אוסף גלויות היסטוריות מערי גליציה מספק הצצה מרתקת לחיי היומיום של הקהילות היהודיות במאה ה-19 ותחילת המאה ה-20.",
        contentI18n: {
          he: "אוסף גלויות היסטוריות מערי גליציה מספק הצצה מרתקת לחיי היומיום.",
          en: "A collection of historic postcards from Galician towns provides a fascinating glimpse into daily life of Jewish communities.",
          pl: "Kolekcja historycznych pocztówek z miast galicyjskich daje fascynujący wgląd w codzienne życie.",
        },
        excerpt: "גלויות מימי האימפריה האוסטרו-הונגרית",
        excerptI18n: { he: "גלויות מימי האימפריה", en: "Postcards from the Austro-Hungarian era", pl: "Pocztówki z czasów Austro-Węgier" },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[0].id }] },
        tags: { connect: [{ id: tags[0].id }, { id: tags[4].id }, { id: tags[5].id }] },
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: "התיישבות יהודית בווהלין",
        titleI18n: { he: "התיישבות יהודית בווהלין", en: "Jewish Settlement in Volhynia", pl: "Osadnictwo żydowskie na Wołyniu" },
        slug: "jewish-settlement-volhynia",
        content: "ההתיישבות היהודית בווהלין מתוחה לימי הביניים. האזור היה מרכז חשוב לחסידות ולחיים יהודיים מסורתיים.",
        contentI18n: {
          he: "ההתיישבות היהודית בווהלין מתוחה לימי הביניים.",
          en: "Jewish settlement in Volhynia dates back to the Middle Ages. The region was an important center for Hasidism.",
          pl: "Osadnictwo żydowskie na Wołyniu sięga średniowiecza.",
        },
        status: "published",
        authorId: admin.id,
        categories: { connect: [{ id: categories[4].id }] },
        tags: { connect: [{ id: tags[5].id }] },
        regions: { connect: [{ id: regions[2].id }] },
      },
    }),
    prisma.post.create({
      data: {
        title: "טיוטה: מסחר יהודי בקראקוב",
        titleI18n: { he: "מסחר יהודי בקראקוב", en: "Jewish Commerce in Krakow", pl: "Handel żydowski w Krakowie" },
        slug: "jewish-commerce-krakow",
        content: "טיוטה של מאמר על המסחר היהודי בקראקוב.",
        status: "draft",
        authorId: admin.id,
        categories: { connect: [{ id: categories[0].id }] },
      },
    }),
  ]);

  const pages = await Promise.all([
    prisma.page.create({
      data: {
        title: "אודות",
        titleI18n: { he: "אודות", en: "About", pl: "O nas" },
        slug: "about",
        content: "# אודות הפרויקט\n\nפרויקט קהל הוא פלטפורמה מחקרית דיגיטלית המנגישה חומרים היסטוריים על קהילות יהודיות במזרח אירופה. הפלטפורמה כוללת מפות, מאגרי מידע, מסמכים היסטוריים ומאמרים מחקריים.",
        contentI18n: {
          he: "# אודות הפרויקט\n\nפרויקט קהל הוא פלטפורמה מחקרית דיגיטלית.",
          en: "# About the Project\n\nThe Kahal Project is a digital research platform making historical materials about Jewish communities in Eastern Europe accessible.",
          pl: "# O projekcie\n\nProjekt Kahal to cyfrowa platforma badawcza udostępniająca materiały historyczne.",
        },
        status: "published",
        authorId: admin.id,
        menuOrder: 1,
      },
    }),
    prisma.page.create({
      data: {
        title: "צור קשר",
        titleI18n: { he: "צור קשר", en: "Contact", pl: "Kontakt" },
        slug: "contact",
        content: "# צור קשר\n\nניתן ליצור איתנו קשר בכתובת: contact@kahal.org",
        contentI18n: {
          he: "# צור קשר\n\nניתן ליצור איתנו קשר בכתובת: contact@kahal.org",
          en: "# Contact\n\nYou can reach us at: contact@kahal.org",
          pl: "# Kontakt\n\nMożesz się z nami skontaktować pod adresem: contact@kahal.org",
        },
        status: "published",
        authorId: admin.id,
        menuOrder: 2,
      },
    }),
    prisma.page.create({
      data: {
        title: "מדיניות פרטיות",
        titleI18n: { he: "מדיניות פרטיות", en: "Privacy Policy", pl: "Polityka prywatności" },
        slug: "privacy",
        content: "# מדיניות פרטיות\n\nאנו מכבדים את פרטיותכם ומתחייבים להגן על המידע האישי שלכם.",
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
        title: "מפקד אוכלוסין גליציה 1890",
        titleI18n: { he: "מפקד אוכלוסין גליציה 1890", en: "Galicia Census 1890", pl: "Spis ludności Galicji 1890" },
        slug: "galicia-census-1890",
        description: "נתוני מפקד האוכלוסין של גליציה משנת 1890 הכוללים מידע על דת, שפה ומקצוע",
        descriptionI18n: {
          he: "נתוני מפקד האוכלוסין של גליציה משנת 1890",
          en: "Census data from Galicia 1890 including religion, language and occupation",
          pl: "Dane ze spisu ludności Galicji z 1890 roku",
        },
        status: "published",
        maturity: "Validated",
        version: "2.1.0",
        license: "CC BY 4.0",
        minYear: 1890,
        maxYear: 1890,
        categoryId: categories[1].id,
        citationText: "Kahal Project, Galicia Census 1890 Dataset, v2.1.0",
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: "רשימת יישובים יהודיים בקונגרס פולין",
        titleI18n: { he: "רשימת יישובים יהודיים בקונגרס פולין", en: "Jewish Settlements in Congress Poland", pl: "Osady żydowskie w Kongresówce" },
        slug: "jewish-settlements-congress-poland",
        description: "רשימה מקיפה של יישובים יהודיים בקונגרס פולין במאה ה-19",
        descriptionI18n: {
          he: "רשימה מקיפה של יישובים יהודיים",
          en: "Comprehensive list of Jewish settlements in Congress Poland in the 19th century",
          pl: "Kompleksowa lista osad żydowskich w Kongresówce w XIX wieku",
        },
        status: "published",
        maturity: "Provisional",
        version: "1.0.0",
        license: "CC BY-SA 4.0",
        minYear: 1800,
        maxYear: 1914,
        categoryId: categories[4].id,
        regions: { connect: [{ id: regions[1].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: "בתי כנסת בגליציה - מאגר מידע",
        titleI18n: { he: "בתי כנסת בגליציה", en: "Synagogues of Galicia Database", pl: "Baza danych synagog Galicji" },
        slug: "synagogues-galicia-db",
        description: "מאגר מידע על בתי כנסת היסטוריים בגליציה כולל מיקום, שנת בנייה ותיאור אדריכלי",
        status: "published",
        maturity: "Preliminary",
        version: "0.9.0",
        minYear: 1600,
        maxYear: 1939,
        categoryId: categories[3].id,
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.dataset.create({
      data: {
        title: 'נתוני שמות משפחה יהודיים',
        titleI18n: { he: 'נתוני שמות משפחה יהודיים', en: 'Jewish Surname Data', pl: 'Dane o żydowskich nazwiskach' },
        slug: 'jewish-surname-data',
        description: 'שמות משפחה יהודיים לפי אזור גאוגרפי ותקופה',
        descriptionI18n: {
          he: 'שמות משפחה יהודיים לפי אזור גאוגרפי ותקופה',
          en: 'Jewish surnames by geographic region and period',
          pl: 'Żydowskie nazwiska według regionu i okresu',
        },
        status: 'published',
        maturity: 'Preliminary',
        version: '1.0.0',
        license: 'CC BY 4.0',
        minYear: 1765,
        maxYear: 1914,
        categoryId: categories[1].id,
        regions: { connect: [{ id: regions[0].id }, { id: regions[1].id }] },
      },
    }),
  ]);

  const artifacts = await Promise.all([
    prisma.artifact.create({
      data: {
        title: 'פנקס קהילת בראד, 1743',
        titleI18n: { he: 'פנקס קהילת בראד, 1743', en: 'Brody Community Ledger, 1743', pl: 'Księga gminy Brody, 1743' },
        slug: 'brody-community-ledger-1743',
        description: 'פנקס קהילה מקורי המתעד את חיי הקהילה היהודית בבראד במאה ה-18',
        descriptionI18n: { he: 'פנקס קהילה מקורי', en: 'Original community ledger documenting Jewish life in Brody', pl: 'Oryginalna księga gminna' },
        excerpt: 'פנקס קהילה',
        excerptI18n: { he: 'פנקס קהילה', en: 'Community ledger', pl: 'Księga gminna' },
        year: 1743,
        dateDisplay: '1743',
        categoryId: categories[0].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[4].id }, { id: tags[5].id }] },
      },
    }),
    prisma.artifact.create({
      data: {
        title: 'תעודת מסע — לבוב, 1862',
        titleI18n: { he: 'תעודת מסע — לבוב, 1862', en: 'Travel Document — Lviv, 1862', pl: 'Dokument podróżny — Lwów, 1862' },
        slug: 'travel-doc-lviv-1862',
        description: 'תעודת מסע רשמית שהונפקה ליהודי מלבוב בשנת 1862',
        excerpt: 'תעודה רשמית',
        year: 1862,
        dateDisplay: '1862',
        categoryId: categories[0].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[4].id }] },
      },
    }),
    prisma.artifact.create({
      data: {
        title: 'רשימת נישואין — קראקוב, 1801',
        titleI18n: { he: 'רשימת נישואין — קראקוב, 1801', en: 'Marriage Registry — Krakow, 1801', pl: 'Rejestr małżeństw — Kraków, 1801' },
        slug: 'marriage-registry-krakow-1801',
        description: 'רישום אזרחי של נישואין יהודיים בקראקוב',
        excerpt: 'רישום אזרחי',
        year: 1801,
        dateDisplay: '1801',
        categoryId: categories[0].id,
        regions: { connect: [{ id: regions[0].id }] },
      },
    }),
    prisma.artifact.create({
      data: {
        title: 'צוואת ר׳ אליעזר — טרנופול, 1789',
        titleI18n: { he: 'צוואת ר׳ אליעזר — טרנופול, 1789', en: "Rabbi Eliezer's Will — Ternopil, 1789", pl: 'Testament rabina Eliezera — Tarnopol, 1789' },
        slug: 'rabbi-eliezer-will-ternopil-1789',
        description: 'צוואה אישית של רב מטרנופול המתעדת חיי קהילה ומנהגים',
        excerpt: 'מסמך אישי',
        year: 1789,
        dateDisplay: '1789',
        categoryId: categories[3].id,
        regions: { connect: [{ id: regions[0].id }] },
        tags: { connect: [{ id: tags[5].id }] },
      },
    }),
  ]);

  const siteLinks = await Promise.all([
    prisma.siteLink.create({
      data: {
        title: 'מנוע חיפוש קהילות',
        titleI18n: { he: 'מנוע חיפוש קהילות', en: 'Community Search Engine', pl: 'Wyszukiwarka społeczności' },
        description: 'חיפוש לפי שם, מחוז או גוברניה',
        descriptionI18n: { he: 'חיפוש לפי שם, מחוז או גוברניה', en: 'Search by name, district, or governorate', pl: 'Szukaj według nazwy, powiatu lub guberni' },
        icon: 'Globe',
        url: '/search',
        order: 1,
        status: 'published',
      },
    }),
    prisma.siteLink.create({
      data: {
        title: 'כלי השוואת מפקדים',
        titleI18n: { he: 'כלי השוואת מפקדים', en: 'Census Comparison Tool', pl: 'Narzędzie porównywania spisów' },
        description: 'השוואת נתונים בין מפקדים שונים',
        descriptionI18n: { he: 'השוואת נתונים בין מפקדים שונים', en: 'Compare data across different censuses', pl: 'Porównaj dane z różnych spisów' },
        icon: 'Database',
        url: '/tools/census-compare',
        order: 2,
        status: 'published',
      },
    }),
    prisma.siteLink.create({
      data: {
        title: 'ארכיון מסמכים דיגיטלי',
        titleI18n: { he: 'ארכיון מסמכים דיגיטלי', en: 'Digital Document Archive', pl: 'Cyfrowe archiwum dokumentów' },
        description: 'דפדוף בתעודות סרוקות',
        descriptionI18n: { he: 'דפדוף בתעודות סרוקות', en: 'Browse scanned documents', pl: 'Przeglądaj zeskanowane dokumenty' },
        icon: 'Scroll',
        url: '/archive',
        order: 3,
        status: 'published',
      },
    }),
    prisma.siteLink.create({
      data: {
        title: 'מפה אינטראקטיבית',
        titleI18n: { he: 'מפה אינטראקטיבית', en: 'Interactive Map', pl: 'Mapa interaktywna' },
        description: 'צפייה בשכבות היסטוריות',
        descriptionI18n: { he: 'צפייה בשכבות היסטוריות', en: 'View historical layers', pl: 'Przeglądaj warstwy historyczne' },
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
        title: "יישובים יהודיים בגליציה 1890",
        titleI18n: { he: "יישובים יהודיים בגליציה 1890", en: "Jewish Settlements in Galicia 1890", pl: "Osady żydowskie w Galicji 1890" },
        slug: "jewish-settlements-galicia-1890",
        description: "מפת יישובים יהודיים בגליציה על פי מפקד 1890",
        descriptionI18n: {
          he: "מפת יישובים יהודיים בגליציה",
          en: "Map of Jewish settlements in Galicia based on 1890 census",
          pl: "Mapa osad żydowskich w Galicji na podstawie spisu z 1890",
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
        title: "בתי כנסת בגליציה",
        titleI18n: { he: "בתי כנסת בגליציה", en: "Synagogues in Galicia", pl: "Synagogi w Galicji" },
        slug: "synagogues-galicia-map",
        description: "מפת בתי כנסת היסטוריים בגליציה",
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
        name: "יישובים יהודיים 1890",
        nameI18n: { he: "יישובים יהודיים 1890", en: "Jewish Settlements 1890", pl: "Osady żydowskie 1890" },
        slug: "jewish-settlements-1890",
        description: "שכבת נקודות של יישובים יהודיים בגליציה על פי מפקד 1890",
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
        name: "גבולות גליציה",
        nameI18n: { he: "גבולות גליציה", en: "Galicia Borders", pl: "Granice Galicji" },
        slug: "galicia-borders",
        description: "גבולות גליציה ולודומריה בתקופת השלטון האוסטרי",
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
        name: "בתי כנסת",
        nameI18n: { he: "בתי כנסת", en: "Synagogues", pl: "Synagogi" },
        slug: "synagogues-layer",
        description: "מיקומי בתי כנסת היסטוריים בגליציה",
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
      name: "פנקסי קהילות גליציה",
      nameI18n: { he: "פנקסי קהילות גליציה", en: "Galician Community Records", pl: "Księgi gmin Galicji" },
      descriptionI18n: { he: "אוסף פנקסי קהילות מגליציה", en: "Collection of community records from Galicia", pl: "Zbiór ksiąg gminnych z Galicji" },
      yearMin: 1780,
      yearMax: 1914,
      regions: { connect: [{ id: regions[0].id }] },
      tags: { connect: [{ id: tags[4].id }] },
    },
  });

  const series1 = await prisma.series.create({
    data: {
      name: "פנקסי קהילת לבוב",
      nameI18n: { he: "פנקסי קהילת לבוב", en: "Lviv Community Records", pl: "Księgi gminy Lwów" },
      slug: "lviv-community-records",
      description: "פנקסי הקהילה היהודית של לבוב",
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
      title: "פנקס קהילת לבוב כרך א",
      titleI18n: { he: "פנקס קהילת לבוב כרך א", en: "Lviv Community Record Vol. 1", pl: "Księga gminy Lwów t. 1" },
      slug: "lviv-vol-1",
      description: "כרך ראשון של פנקס קהילת לבוב, 1800-1830",
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
          { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts", pl: "Artykuły" }, url: "/posts", order: 1 },
          { label: "מפות", labelI18n: { he: "מפות", en: "Maps", pl: "Mapy" }, url: "/maps", order: 2 },
          { label: "שכבות", labelI18n: { he: "שכבות", en: "Layers", pl: "Warstwy" }, url: "/layers", order: 3 },
          { label: "נתונים", labelI18n: { he: "נתונים", en: "Data", pl: "Dane" }, url: "/data", order: 4 },
          { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive", pl: "Archiwum" }, url: "/archive", order: 5 },
          { label: "אודות", labelI18n: { he: "אודות", en: "About", pl: "O nas" }, url: "/about", order: 6 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      location: "HERO_ACTIONS",
      items: {
        create: [
          { label: "חפשו במפות", labelI18n: { he: "חפשו במפות", en: "Explore Maps", pl: "Przeglądaj mapy" }, url: "/maps", icon: "Map", variant: "BUTTON_SOLID", order: 1 },
          { label: "עיינו בנתונים", labelI18n: { he: "עיינו בנתונים", en: "Browse Data", pl: "Przeglądaj dane" }, url: "/data", icon: "Database", variant: "BUTTON_OUTLINE", order: 2 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      location: "HERO_GRID",
      items: {
        create: [
          { label: "מפות", labelI18n: { he: "מפות", en: "Maps", pl: "Mapy" }, url: "/maps", icon: "Map", variant: "CARD", order: 1 },
          { label: "נתונים", labelI18n: { he: "נתונים", en: "Data", pl: "Dane" }, url: "/data", icon: "Database", variant: "CARD", order: 2 },
          { label: "ארכיון", labelI18n: { he: "ארכיון", en: "Archive", pl: "Archiwum" }, url: "/archive", icon: "BookOpen", variant: "CARD", order: 3 },
          { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts", pl: "Artykuły" }, url: "/posts", icon: "FileText", variant: "CARD", order: 4 },
        ],
      },
    },
  });

  await prisma.menu.create({
    data: {
      location: "HERO_STRIP",
      items: {
        create: [
          { label: "קהילות", labelI18n: { he: "קהילות", en: "Communities", pl: "Społeczności" }, url: "/categories/communities", icon: "Users", order: 1 },
          { label: "היסטוריה", labelI18n: { he: "היסטוריה", en: "History", pl: "Historia" }, url: "/categories/history", icon: "Clock", order: 2 },
          { label: "דמוגרפיה", labelI18n: { he: "דמוגרפיה", en: "Demographics", pl: "Demografia" }, url: "/categories/demographics", icon: "BarChart", order: 3 },
        ],
      },
    },
  });

  const footerCol1 = await prisma.footerColumn.create({
    data: {
      type: "LINK_LIST",
      order: 1,
      title: "ניווט",
      titleI18n: { he: "ניווט", en: "Navigation", pl: "Nawigacja" },
      items: {
        create: [
          { label: "מאמרים", labelI18n: { he: "מאמרים", en: "Posts", pl: "Artykuły" }, url: "/posts", order: 1 },
          { label: "מפות", labelI18n: { he: "מפות", en: "Maps", pl: "Mapy" }, url: "/maps", order: 2 },
          { label: "נתונים", labelI18n: { he: "נתונים", en: "Data", pl: "Dane" }, url: "/data", order: 3 },
        ],
      },
    },
  });

  await prisma.footerColumn.create({
    data: {
      type: "RICH_TEXT",
      order: 2,
      title: "אודות",
      titleI18n: { he: "אודות", en: "About", pl: "O nas" },
      content: "פרויקט קהל - פלטפורמה מחקרית להנגשת חומרים היסטוריים על קהילות יהודיות במזרח אירופה.",
      contentI18n: {
        he: "פרויקט קהל - פלטפורמה מחקרית להנגשת חומרים היסטוריים.",
        en: "The Kahal Project - a research platform for making historical materials accessible.",
        pl: "Projekt Kahal - platforma badawcza udostępniająca materiały historyczne.",
      },
    },
  });

  await prisma.siteSettings.create({
    data: {
      key: "global",
      copyrightText: "© 2026 פרויקט קהל. כל הזכויות שמורות.",
      copyrightI18n: {
        he: "© 2026 פרויקט קהל. כל הזכויות שמורות.",
        en: "© 2026 Kahal Project. All rights reserved.",
        pl: "© 2026 Projekt Kahal. Wszelkie prawa zastrzeżone.",
      },
    },
  });

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
  console.log(`  1 collection, 1 series, 1 volume, 5 pages`);
  console.log(`  4 menus (header, hero_actions, hero_grid, hero_strip)`);
  console.log(`  2 footer columns`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
