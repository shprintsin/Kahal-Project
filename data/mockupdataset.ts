import { LicenseType, ResearchDataset } from "@/types/dataset";

export const mockDatasets: ResearchDataset[] = [
  // ------------------------------------------------------------------
  // דוגמה 1: "סטנדרט הזהב" (מפקד לובלין 1764)
  // נתונים מאומתים, מלאים, עם דוקומנטציה עשירה
  // ------------------------------------------------------------------
  {
    id: "ds-1764-lublin-01",
    slug: "lublin-census-1764",
    title: "מפקד אוכלוסין יהודי: גליל לובלין (1764)",
    
    // קטגוריה וסטטוס
    category: "דמוגרפיה ומיסוי",
    status: "published",      // סטטוס מערכת: פורסם
    maturity: "verified",     // בשלות הנתונים: מאומת (עבר ביקורת)
    
    version: "2.1.0",
    created_at: new Date("2024-01-15"),
    last_updated: new Date("2024-12-20"),

    temporal_coverage: {
      start_year: 1764,
      end_year: 1765
    },
    geographic_coverage: "גליל לובלין (Województwo Lubelskie)",
    
    license: LicenseType.CC_BY,
    citation_text: "גולדברג, א. (2024). מפקד יהודי לובלין 1764 [מאגר נתונים]. פרויקט הקהילות.",

    // תיאור בפורמט Markdown - טקסט חופשי ועשיר
    description: `
### הקשר היסטורי
מאגר זה מציג את רישום מס הגולגולת (Pogłówne) המלא של האוכלוסייה היהודית בגליל לובלין, שנערך בעקבות החלטות הסיים (Sejm) של שנת 1764. מטרת המפקד הייתה ארגון מחדש של שיטת המיסוי באיחוד הפולני-ליטאי.

### מתודולוגיה
הנתונים תועתקו ידנית מתוך הרשומות המקוריות השמורות ב**ארכיון המרכזי לתיקים עתיקים בוורשה (AGAD)**, תחת אוסף "Archiwum Skarbu Koronnego".

**מאפיינים עיקריים:**
* כולל 42 קהילות (Kahals) והיישובים הנספחים אליהן (Przykahalki).
* שמות העיירות עברו תקינון (סטנדרטיזציה) לפי ה-Słownik Geograficzny.
* הבחנה ברורה בין ראשי בתי אב, תינוקות (מתחת לגיל שנה) ופטורים ממס.

**הערות לגרסה 2.1:**
תוקנו שגיאות תעתיק בתת-מחוז פרצ'ב (Parczew) בעקבות משוב מחוקרים.
    `,

    // דוקומנטציה וקודבוק
    codebook_url: "https://project-kahal.org/docs/1764_codebook_v2.pdf",
    
    codebook_text: `
## מבנה הנתונים - מדריך שימוש

### עמודות עיקריות בקובץ

#### 1. עמודות זיהוי
- **id**: מזהה ייחודי לכל רשומה
- **kahal_name**: שם הקהל (הקהילה הראשית)
- **town_std**: שם היישוב המתוקנן (לפי Słownik Geograficzny)
- **town_orig**: שם היישוב כפי שמופיע במקור

#### 2. עמודות דמוגרפיות
- **fam_head_orig**: שם ראש המשפחה (תעתיק מהמקור הלטיני)
- **fam_head_he**: שם ראש המשפחה בעברית (שחזור)
- **num_souls**: מספר הנפשות במשפחה
- **num_infants**: מספר תינוקות (מתחת לגיל שנה - פטורים ממס)

#### 3. עמודות מיסוי
- **tax_zloty**: סכום המס בזהובים (Złoty Polskie)
- **tax_grosz**: סכום המס בגרושים (30 גרוש = 1 זהוב)
- **exemption_status**: האם המשפחה פטורה ממס (כן/לא)
- **exemption_reason**: סיבת הפטור (עני, חולה, רב, וכו')

#### 4. עמודות גיאוגרפיות
- **wojewodztwo**: מחוז (Województwo)
- **powiat**: תת-מחוז (Powiat)
- **coordinates_lat**: קו רוחב (משוחזר מתוך מפות היסטוריות)
- **coordinates_lon**: קו אורך (משוחזר מתוך מפות היסטוריות)

### סוגי נתונים וערכים

| עמודה | סוג | טווח ערכים | הערות |
|-------|-----|-----------|--------|
| id | מספר שלם | 1-15000 | רציף |
| num_souls | מספר שלם | 1-20 | ממוצע: 4.2 |
| tax_zloty | מספר עשרוני | 0.0-50.0 | יחידות: złoty |
| exemption_status | קטגורי | [yes, no] | ברירת מחדל: no |

### קודים קטגוריים

#### exemption_reason (סיבות פטור)
- **poor**: עניות
- **sick**: מחלה
- **rabbi**: רב קהילה
- **elderly**: זקנה (מעל גיל 70)
- **widow**: אלמנה
- **military**: שירות צבאי לכתר
- **other**: אחר (ראה הערות)

#### wojewodztwo (מחוזות)
- **lublin**: גליל לובלין
- **krakow**: גליל קרקוב
- **sandomierz**: גליל סנדומייז'
- **ruthenia**: רוסיה האדומה (Ruś Czerwona)

### שימושים נפוצים

#### דוגמה 1: חישוב גודל קהילה
\`\`\`sql
SELECT kahal_name, COUNT(*) as num_families, SUM(num_souls) as total_population
FROM census_1764
GROUP BY kahal_name
ORDER BY total_population DESC;
\`\`\`

#### דוגמה 2: אחוז הפטורים ממס
\`\`\`python
df = pd.read_csv('lublin_1764_clean.csv')
exemption_rate = (df['exemption_status'] == 'yes').mean() * 100
print(f"שיעור הפטורים: {exemption_rate:.1f}%")
\`\`\`

### בעיות ידועות ומגבלות

1. **שמות עיירות**: כ-5% מהעיירות לא זוהו במדויק במפות מודרניות
2. **שמות אישיים**: התעתיק מלטינית אינו אחיד (תלוי בשופט)
3. **נתונים חסרים**: בכ-2% מהרשומות חסר מספר הנפשות
4. **קואורדינטות**: משוערות בלבד, אל תשתמשו למיפוי מדויק

### ציטוט

אם אתם משתמשים במאגר זה, אנא ציטטו:

> גולדברג, א. (2024). *מפקד יהודי לובלין 1764* [מאגר נתונים]. פרויקט הקהילות. https://project-kahal.org/data/lublin-1764

### שאלות ותמיכה

לשאלות לגבי המאגר: data@project-kahal.org
    `,
    
    // הגדרת משתנים לטבלת מקרא באתר
    variables_schema: [
      {
        name: "town_std",
        label: "שם עיירה (מתוקנן)",
        type: "string",
        description: "הכתיב הפולני המודרני של שם המקום."
      },
      {
        name: "fam_head_orig",
        label: "ראש משפחה (מקור)",
        type: "string",
        description: "השם כפי שמופיע בכתב היד המקורי (תעתיק לטיני)."
      },
      {
        name: "tax_zloty",
        label: "סכום מס",
        type: "float",
        description: "גובה המס בזהובים (Złoty Polskie)."
      }
    ],

    tags: [],
    // הקבצים להורדה (יופיעו בסרגל הצד)
    resources: [
      {
        id: "res-01",
        name: "נתונים מעובדים (Excel)",
        url: "/downloads/lublin_1764_clean.xlsx",
        format: "XLSX",
        size_bytes: 2560000, // ~2.5MB
        is_main_file: true
      },
      {
        id: "res-02",
        name: "קובץ לניתוח סטטיסטי (Stata .dta)",
        url: "/downloads/lublin_1764_v2.dta",
        format: "STATA",
        size_bytes: 1200000,
        is_main_file: false
      },
      {
        id: "res-03",
        name: "סריקת מקור (PDF)",
        url: "/downloads/scans/agad_vol_88.pdf",
        format: "PDF",
        size_bytes: 45000000, // 45MB
        is_main_file: false
      }
    ]
  },

  
  {
    id: "ds-grodno-ocr-beta",
    slug: "grodno-inventory-ocr",
    title: "אינוונטר נכסים גרודנו (1780) - תמליל בינה מלאכותית",
    
    category: "נדל״ן ורכוש",
    status: "published",
    maturity: "experimental", // <--- חשוב! זה יקפיץ תגית "ניסיוני" ב-UI
    
    version: "0.5.0-beta",
    created_at: new Date("2025-12-28"),
    last_updated: new Date("2025-12-28"),

    temporal_coverage: {
      start_year: 1780,
      end_year: 1780
    },
    
    license: LicenseType.CC0, // נחלת הכלל
    
    description: `
**אזהרה: מאגר נתונים ניסיוני**

מאגר זה נוצר באופן אוטומטי באמצעות סקריפט פייתון ייעודי (Surya-OCR) על גבי סריקות מהארכיון הממשלתי בגרודנו. **הנתונים לא עברו אימות מלא על ידי היסטוריון אנושי.**

### בעיות ידועות
1. זיהוי כתב היד הלטיני עומד כרגע על כ-85% דיוק.
2. ייתכנו שגיאות בזיהוי ספרות בעמודת "מס" (למשל בלבול בין '1' ל-'7').
3. שמות העיירות עברו למטיזציה (Lemmatization) באמצעות Stanza NLP אך עדיין ייתכנו שגיאות הטיה.

השימוש בנתונים אלו מומלץ למחקר גישוש (Exploratory) בלבד. אם ברצונך לסייע בתיקון הנתונים, אנא השתמש בקישור "דווח על טעות".
    `,

    // אין כאן לינק לקודבוק כי זה עדיין ניסיוני
    variables_schema: [
      {
        name: "raw_text",
        label: "פלט OCR גולמי",
        type: "string",
        description: "שורת הטקסט הגולמית כפי שזוהתה בתמונה."
      },
      {
        name: "confidence_score",
        label: "ציון סמך (Confidence)",
        type: "float",
        description: "ערך בין 0-1 המציין את רמת הביטחון של האלגוריתם בזיהוי."
      }
    ],

    tags: [],
    resources: [
      {
        id: "res-grodno-json",
        name: "פלט OCR גולמי (JSON)",
        url: "/downloads/grodno_ocr_raw.json",
        format: "JSON",
        size_bytes: 512000, // 500KB
        is_main_file: true
      },
      {
        id: "res-grodno-csv",
        name: "טבלה מעובדת (CSV)",
        url: "/downloads/grodno_parsed.csv",
        format: "CSV",
        size_bytes: 120000,
        is_main_file: false
      }
    ]
  }
];