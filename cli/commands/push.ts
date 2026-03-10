import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getPrisma } from "../db";

export async function pushContent(filePath: string, type: string) {
  const prisma = getPrisma();
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(absolutePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  const slug = frontmatter.slug || path.basename(filePath, path.extname(filePath));
  const title = frontmatter.title || slug;
  const status = frontmatter.status || "draft";
  const language = frontmatter.language || "HE";
  const excerpt = frontmatter.excerpt || "";

  if (type === "post") {
    const existing = await prisma.post.findUnique({ where: { slug } });

    if (existing) {
      await prisma.post.update({
        where: { slug },
        data: { title, content, excerpt, status, language },
      });
      console.log(`Updated post: ${slug}`);
    } else {
      await prisma.post.create({
        data: { title, slug, content, excerpt, status, language },
      });
      console.log(`Created post: ${slug}`);
    }

    if (frontmatter.categories?.length) {
      const post = await prisma.post.findUnique({ where: { slug } });
      if (post) {
        const cats = await prisma.category.findMany({
          where: { slug: { in: frontmatter.categories } },
        });
        await prisma.post.update({
          where: { slug },
          data: { categories: { set: cats.map((c) => ({ id: c.id })) } },
        });
      }
    }

    if (frontmatter.regions?.length) {
      const post = await prisma.post.findUnique({ where: { slug } });
      if (post) {
        const regions = await prisma.region.findMany({
          where: { slug: { in: frontmatter.regions } },
        });
        await prisma.post.update({
          where: { slug },
          data: { regions: { set: regions.map((r) => ({ id: r.id })) } },
        });
      }
    }
  } else if (type === "page") {
    const existing = await prisma.page.findUnique({ where: { slug } });

    if (existing) {
      await prisma.page.update({
        where: { slug },
        data: { title, content, excerpt, status, language },
      });
      console.log(`Updated page: ${slug}`);
    } else {
      await prisma.page.create({
        data: { title, slug, content, excerpt, status, language },
      });
      console.log(`Created page: ${slug}`);
    }
  } else {
    console.error(`Unknown type: ${type}. Use "post" or "page".`);
    process.exit(1);
  }

  await prisma.$disconnect();
}
