/**
 * Migration script: Merge ResearchDataset data into the unified Dataset (maps) table.
 *
 * This script:
 * 1. For each ResearchDataset, creates a new row in the `maps` table with its metadata
 * 2. Transfers DatasetResource references (sets map_id to the new dataset)
 * 3. Transfers Region M2M associations from _RegionToResearchDataset to _MapToRegion
 * 4. Logs all operations for review
 *
 * Run AFTER the Prisma schema migration adds new columns to maps table,
 * but BEFORE dropping the research_datasets table.
 *
 * Usage: npx tsx scripts/migrate-datasets.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Dataset Migration: ResearchDataset → Unified Dataset ===\n");

  const oldDatasets = await prisma.$queryRaw<
    {
      id: string;
      slug: string;
      title: string;
      title_i18n: unknown;
      description: string | null;
      description_i18n: unknown;
      summary: string | null;
      summary_i18n: unknown;
      codebook_text: string | null;
      codebook_text_i18n: unknown;
      citation_text: string | null;
      sources: string | null;
      sources_i18n: unknown;
      status: string;
      maturity: string;
      version: string | null;
      license: string | null;
      is_visible: boolean;
      is_featured: boolean;
      thumbnail_id: string | null;
      category_id: string | null;
      min_year: number | null;
      max_year: number | null;
      created_at: Date;
      updated_at: Date;
    }[]
  >`SELECT * FROM research_datasets`;

  console.log(`Found ${oldDatasets.length} ResearchDataset records to migrate.\n`);

  if (oldDatasets.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  const existingSlugs = await prisma.$queryRaw<{ slug: string }[]>`
    SELECT slug FROM maps
  `;
  const slugSet = new Set(existingSlugs.map((r) => r.slug));

  let migrated = 0;
  let skipped = 0;

  for (const ds of oldDatasets) {
    let targetSlug = ds.slug;
    if (slugSet.has(targetSlug)) {
      targetSlug = `${ds.slug}-data`;
      if (slugSet.has(targetSlug)) {
        targetSlug = `${ds.slug}-dataset-${Date.now()}`;
      }
    }

    console.log(`Migrating: "${ds.title}" (${ds.slug} → ${targetSlug})`);

    try {
      const [newDataset] = await prisma.$queryRaw<{ id: string }[]>`
        INSERT INTO maps (
          id, slug, title, title_i18n, description, description_i18n,
          summary, summary_i18n, codebook_text, codebook_text_i18n,
          citation_text, citation_text_i18n, sources, sources_i18n,
          status, maturity, version, license, is_visible, is_featured,
          thumbnail_id, category_id, year_min, year_max,
          config, global_style_config, reference_links,
          created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${targetSlug}, ${ds.title},
          ${JSON.stringify(ds.title_i18n || {})}::jsonb,
          ${ds.description},
          ${JSON.stringify(ds.description_i18n || {})}::jsonb,
          ${ds.summary},
          ${JSON.stringify(ds.summary_i18n || {})}::jsonb,
          ${ds.codebook_text},
          ${JSON.stringify(ds.codebook_text_i18n || {})}::jsonb,
          ${ds.citation_text},
          '{}'::jsonb,
          ${ds.sources},
          ${JSON.stringify(ds.sources_i18n || {})}::jsonb,
          ${ds.status}::content_status,
          ${ds.maturity}::data_maturity,
          ${ds.version},
          ${ds.license},
          ${ds.is_visible},
          ${ds.is_featured},
          ${ds.thumbnail_id},
          ${ds.category_id},
          ${ds.min_year},
          ${ds.max_year},
          '{}'::jsonb, '{}'::jsonb, '[]'::jsonb,
          ${ds.created_at}, ${ds.updated_at}
        )
        RETURNING id
      `;

      const newId = newDataset.id;

      const resourceResult = await prisma.$executeRaw`
        UPDATE dataset_resources
        SET map_id = ${newId}::uuid
        WHERE dataset_id = ${ds.id}::uuid
          AND map_id IS NULL
      `;
      console.log(`  → Transferred ${resourceResult} resources`);

      const regionResult = await prisma.$executeRaw`
        INSERT INTO "_MapToRegion" ("A", "B")
        SELECT ${newId}::uuid, "B"
        FROM "_RegionToResearchDataset"
        WHERE "A" = ${ds.id}::uuid
        ON CONFLICT DO NOTHING
      `;
      console.log(`  → Transferred ${regionResult} region associations`);

      slugSet.add(targetSlug);
      migrated++;
    } catch (err) {
      console.error(`  ✗ Failed to migrate "${ds.title}":`, err);
      skipped++;
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped/Failed: ${skipped}`);

  const totalMaps = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM maps
  `;
  console.log(`Total records in maps table: ${totalMaps[0].count}`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
