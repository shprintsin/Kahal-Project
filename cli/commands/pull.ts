import fs from "fs";
import path from "path";
import { getPrisma } from "../db";

export async function pullContent(type: string, outputDir: string, status: string) {
  const prisma = getPrisma();
  const outPath = path.resolve(outputDir, type);
  fs.mkdirSync(outPath, { recursive: true });

  if (type === "posts") {
    const posts = await prisma.post.findMany({
      where: status === "all" ? {} : { status: status as any },
      include: { categories: true, regions: true },
    });

    for (const post of posts) {
      const frontmatter = [
        "---",
        `title: "${post.title}"`,
        `slug: "${post.slug}"`,
        `status: ${post.status}`,
        `language: ${post.language}`,
        post.excerpt ? `excerpt: "${post.excerpt}"` : null,
        post.categories.length
          ? `categories: [${post.categories.map((c) => c.slug).join(", ")}]`
          : null,
        post.regions.length
          ? `regions: [${post.regions.map((r) => r.slug).join(", ")}]`
          : null,
        `createdAt: ${post.createdAt.toISOString()}`,
        "---",
      ]
        .filter(Boolean)
        .join("\n");

      const filePath = path.join(outPath, `${post.slug}.md`);
      fs.writeFileSync(filePath, `${frontmatter}\n${post.content || ""}`);
    }

    console.log(`Exported ${posts.length} posts to ${outPath}`);
  } else if (type === "pages") {
    const pages = await prisma.page.findMany({
      where: status === "all" ? {} : { status: status as any },
    });

    for (const page of pages) {
      const frontmatter = [
        "---",
        `title: "${page.title}"`,
        `slug: "${page.slug}"`,
        `status: ${page.status}`,
        `language: ${page.language}`,
        page.excerpt ? `excerpt: "${page.excerpt}"` : null,
        `createdAt: ${page.createdAt.toISOString()}`,
        "---",
      ]
        .filter(Boolean)
        .join("\n");

      const filePath = path.join(outPath, `${page.slug}.md`);
      fs.writeFileSync(filePath, `${frontmatter}\n${page.content || ""}`);
    }

    console.log(`Exported ${pages.length} pages to ${outPath}`);
  } else if (type === "layers") {
    const layers = await prisma.layer.findMany({
      where: status === "all" ? {} : { status: status as any },
      select: {
        slug: true,
        name: true,
        description: true,
        type: true,
        status: true,
        geoJsonData: true,
        sourceUrl: true,
      },
    });

    for (const layer of layers) {
      const filePath = path.join(outPath, `${layer.slug}.geojson`);
      if (layer.geoJsonData) {
        fs.writeFileSync(filePath, JSON.stringify(layer.geoJsonData, null, 2));
      }
    }

    const metaPath = path.join(outPath, "_metadata.json");
    fs.writeFileSync(
      metaPath,
      JSON.stringify(
        layers.map(({ geoJsonData, ...rest }) => rest),
        null,
        2
      )
    );

    console.log(`Exported ${layers.length} layers to ${outPath}`);
  } else {
    console.error(`Unknown type: ${type}. Use "posts", "pages", or "layers".`);
    process.exit(1);
  }

  await prisma.$disconnect();
}
