import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NAV_ITEMS = [
  { label: 'בית', en: 'Home', icon: 'Home', url: '/', order: 1 },
  { label: 'מפות ונתונים', en: 'Maps & Data', icon: 'Database', url: '/data', order: 2 },
  { label: 'דוקומנטציה', en: 'Documentation', icon: 'BookOpen', url: '/docs', order: 3 },
  { label: 'רשימות', en: 'Posts', icon: 'FileText', url: '/posts', order: 4 },
  { label: 'יצירת קשר', en: 'Contact', icon: 'Mail', url: '/contact', order: 5 },
  { label: 'אודות', en: 'About', icon: 'Info', url: '/about', order: 6 },
];

async function main() {
  const existing = await prisma.menu.findUnique({ where: { location: 'HEADER' } });

  if (existing) {
    await prisma.menuItem.deleteMany({ where: { menuId: existing.id } });
    await prisma.menu.delete({ where: { id: existing.id } });
    console.log('Deleted existing HEADER menu');
  }

  const menu = await prisma.menu.create({
    data: {
      location: 'HEADER',
      items: {
        create: NAV_ITEMS.map((item) => ({
          label: item.label,
          labelI18n: { en: item.en, pl: item.en },
          icon: item.icon,
          url: item.url,
          order: item.order,
          variant: 'DEFAULT',
        })),
      },
    },
    include: { items: true },
  });

  console.log(`Created HEADER menu with ${menu.items.length} items:`);
  for (const item of menu.items) {
    console.log(`  ${item.order}. "${item.label}" → icon: ${item.icon}, i18n: ${JSON.stringify(item.labelI18n)}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
