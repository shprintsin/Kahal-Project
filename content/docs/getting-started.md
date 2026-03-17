---
title: מדריך התחלה
description: צעדים ראשונים לעבודה עם פרויקט הקהל
order: 1
---

## דרישות מוקדמות

לפני שמתחילים, ודאו שהכלים הבאים מותקנים:

- **Node.js** 18 ומעלה
- **PostgreSQL** 15 עם PostGIS
- **Git**

## התקנה

```bash
git clone <repo-url>
cd unified
npm install
```

## הגדרת סביבה

צרו קובץ `.env.local` עם המשתנים הבאים:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
NEXTAUTH_SECRET=your-secret-here
```

## הפעלת השרת

```bash
npm run dev
```

גלשו ל-`http://localhost:3000` כדי לראות את האתר.

## מבנה הפרויקט

| תיקייה | תיאור |
|---|---|
| `app/` | נתיבי Next.js |
| `components/` | רכיבי UI משותפים |
| `lib/` | פונקציות עזר |
| `prisma/` | סכמת בסיס הנתונים |
