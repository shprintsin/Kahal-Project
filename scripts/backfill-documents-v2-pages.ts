/**
 * One-off backfill for the documents-v2 versioning + per-page derivation work.
 *
 * After the `add_documents_v2_versioning` migration runs, the new columns
 * (`html`, `heading_path`, `char_start`, `char_end`, `content_hash`, `version`)
 * exist but every existing row is null/default. This script re-renders each
 * translation's markdown through the same pipeline the deploy handler uses
 * and updates the page-text rows in place, leaving versions at 1.
 *
 * Re-run safe: idempotent. It only touches rows whose `content_hash` is null
 * or whose hash differs from what we'd compute now.
 *
 * Usage:
 *   npx tsx scripts/backfill-documents-v2-pages.ts
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
import { derivePages } from '../app/[locale]/documents-v2/lib/derive-pages';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient({ log: ['error', 'warn'] });

async function main() {
  const docs = await prisma.documentV2.findMany({
    select: { id: true, slug: true, currentVersion: true, translations: true },
  });

  console.log(`Backfilling ${docs.length} document(s)…`);
  let updated = 0;
  let skipped = 0;

  for (const doc of docs) {
    for (const t of doc.translations) {
      const pages = await derivePages(t.markdown);
      if (pages.length === 0) {
        console.log(`  ${doc.slug}/${t.lang}: 0 pages, nothing to write`);
        continue;
      }

      // Look up existing rows for this (doc, lang) to decide insert vs update.
      const existing = await prisma.documentV2PageText.findMany({
        where: { documentId: doc.id, lang: t.lang },
        select: { id: true, pageNumber: true, contentHash: true },
      });
      const byPage = new Map(existing.map((r) => [r.pageNumber, r]));

      for (const p of pages) {
        const prev = byPage.get(p.pageNumber);
        if (prev && prev.contentHash === p.contentHash) {
          // Hash unchanged — just make sure derived columns are populated.
          await prisma.documentV2PageText.update({
            where: { id: prev.id },
            data: {
              filename: p.filename,
              text: p.text,
              html: p.html,
              headingPath: p.headingPath as unknown as Prisma.InputJsonValue,
              charStart: p.charStart,
              charEnd: p.charEnd,
              contentHash: p.contentHash,
              version: doc.currentVersion ?? 1,
            },
          });
          skipped += 1;
          continue;
        }
        if (prev) {
          await prisma.documentV2PageText.update({
            where: { id: prev.id },
            data: {
              filename: p.filename,
              text: p.text,
              html: p.html,
              headingPath: p.headingPath as unknown as Prisma.InputJsonValue,
              charStart: p.charStart,
              charEnd: p.charEnd,
              contentHash: p.contentHash,
              version: doc.currentVersion ?? 1,
            },
          });
        } else {
          await prisma.documentV2PageText.create({
            data: {
              documentId: doc.id,
              lang: t.lang,
              pageNumber: p.pageNumber,
              version: doc.currentVersion ?? 1,
              filename: p.filename,
              text: p.text,
              html: p.html,
              headingPath: p.headingPath as unknown as Prisma.InputJsonValue,
              charStart: p.charStart,
              charEnd: p.charEnd,
              contentHash: p.contentHash,
            },
          });
        }
        updated += 1;
      }

      // Drop stragglers from a previous (longer) split.
      const surviving = new Set(pages.map((p) => p.pageNumber));
      for (const r of existing) {
        if (!surviving.has(r.pageNumber)) {
          await prisma.documentV2PageText.delete({ where: { id: r.id } });
        }
      }

      console.log(
        `  ${doc.slug}/${t.lang}: wrote ${pages.length} page(s) (${pages.reduce(
          (acc, p) => acc + p.text.length,
          0,
        )} chars)`,
      );
    }
  }

  console.log(`Done. ${updated} page-row(s) written, ${skipped} unchanged.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
