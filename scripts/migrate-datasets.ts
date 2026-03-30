/**
 * Migration script: Merge ResearchDataset data into the unified Dataset (maps) table.
 *
 * Two cases:
 * 1. ResearchDataset slug matches an existing Map → merge metadata into the Map row
 * 2. ResearchDataset slug has no matching Map → create new row in maps table
 *
 * In both cases: transfer DatasetResource refs and Region M2M associations.
 *
 * Run AFTER `prisma db push` adds new columns to maps table,
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

  const existingMaps = await prisma.$queryRaw<{ id: string; slug: string }[]>`
    SELECT id, slug FROM maps
  `;
  const slugToMapId = new Map(existingMaps.map((m) => [m.slug, m.id]));

  let merged = 0;
  let created = 0;
  let failed = 0;

  for (const ds of oldDatasets) {
    const matchingMapId = slugToMapId.get(ds.slug);

    if (matchingMapId) {
      console.log(`MERGE: "${ds.title}" (${ds.slug}) → existing map ${matchingMapId}`);

      try {
        await prisma.$executeRaw`
          UPDATE maps SET
            citation_text = COALESCE(${ds.citation_text}, citation_text),
            citation_text_i18n = COALESCE(citation_text_i18n, '{}'::jsonb),
            sources = COALESCE(${ds.sources}, sources),
            sources_i18n = COALESCE(${JSON.stringify(ds.sources_i18n || {})}::jsonb, sources_i18n),
            maturity = ${ds.maturity}::data_maturity,
            is_visible = ${ds.is_visible},
            license = COALESCE(${ds.license}, license)
          WHERE id = ${matchingMapId}::uuid
        `;

        const resourceResult = await prisma.$executeRaw`
          UPDATE dataset_resources
          SET map_id = ${matchingMapId}::uuid
          WHERE dataset_id = ${ds.id}::uuid
            AND map_id IS NULL
        `;
        console.log(`  → Transferred ${resourceResult} resources`);

        const regionResult = await prisma.$executeRaw`
          INSERT INTO "_MapToRegion" ("A", "B")
          SELECT ${matchingMapId}::uuid, "B"
          FROM "_RegionToResearchDataset"
          WHERE "A" = ${ds.id}::uuid
          ON CONFLICT DO NOTHING
        `;
        console.log(`  → Transferred ${regionResult} region associations`);

        merged++;
      } catch (err) {
        console.error(`  ✗ Failed to merge "${ds.title}":`, err);
        failed++;
      }
    } else {
      console.log(`CREATE: "${ds.title}" (${ds.slug}) → new dataset row`);

      try {
        const [newRow] = await prisma.$queryRaw<{ id: string }[]>`
          INSERT INTO maps (
            id, slug, title, title_i18n, description, description_i18n,
            summary, summary_i18n, codebook_text, codebook_text_i18n,
            citation_text, citation_text_i18n, sources, sources_i18n,
            status, maturity, version, license, is_visible, is_featured,
            thumbnail_id, category_id, year_min, year_max,
            config, global_style_config, reference_links,
            created_at, updated_at
          ) VALUES (
            gen_random_uuid(), ${ds.slug}, ${ds.title},
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

        const resourceResult = await prisma.$executeRaw`
          UPDATE dataset_resources
          SET map_id = ${newRow.id}::uuid
          WHERE dataset_id = ${ds.id}::uuid
            AND map_id IS NULL
        `;
        console.log(`  → Transferred ${resourceResult} resources`);

        const regionResult = await prisma.$executeRaw`
          INSERT INTO "_MapToRegion" ("A", "B")
          SELECT ${newRow.id}::uuid, "B"
          FROM "_RegionToResearchDataset"
          WHERE "A" = ${ds.id}::uuid
          ON CONFLICT DO NOTHING
        `;
        console.log(`  → Transferred ${regionResult} region associations`);

        created++;
      } catch (err) {
        console.error(`  ✗ Failed to create "${ds.title}":`, err);
        failed++;
      }
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Merged into existing maps: ${merged}`);
  console.log(`Created as new datasets: ${created}`);
  console.log(`Failed: ${failed}`);

  const totalMaps = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM maps
  `;
  const totalResources = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM dataset_resources WHERE map_id IS NOT NULL
  `;
  const orphanResources = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM dataset_resources WHERE map_id IS NULL
  `;

  console.log(`\nTotal datasets (maps table): ${totalMaps[0].count}`);
  console.log(`Resources with map_id set: ${totalResources[0].count}`);
  console.log(`Orphan resources (no map_id): ${orphanResources[0].count}`);
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
