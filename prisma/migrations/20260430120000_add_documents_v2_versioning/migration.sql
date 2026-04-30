-- Step 1 of the documents-v2 storage upgrade: introduce monotonic versioning
-- and per-page derived columns. The reader is not yet reading these columns;
-- this migration only widens the schema so deploys can start populating them.
-- Backfill of existing rows is handled by a separate Node script.

-- documents_v2: monotonically-increasing deploy stamp.
ALTER TABLE "documents_v2"
  ADD COLUMN "current_version" INTEGER NOT NULL DEFAULT 1;

-- document_v2_translations: which version of the parent doc this row was
-- derived from. Today this always matches documents_v2.current_version, but
-- carrying it explicitly lets us reason about old vs current rows uniformly.
ALTER TABLE "document_v2_translations"
  ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- document_v2_page_text: precomputed HTML, heading breadcrumb, char offsets,
-- and a content hash so highlight anchors can survive re-deploys.
ALTER TABLE "document_v2_page_text"
  ADD COLUMN "version"       INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "html"          TEXT,
  ADD COLUMN "heading_path"  JSONB,
  ADD COLUMN "char_start"    INTEGER,
  ADD COLUMN "char_end"      INTEGER,
  ADD COLUMN "content_hash"  TEXT;

-- Old unique key was (document_id, lang, page_number). Once we keep multiple
-- versions per (doc, lang), the page_number alone isn't unique within a doc.
ALTER TABLE "document_v2_page_text"
  DROP CONSTRAINT IF EXISTS "document_v2_page_text_document_id_lang_page_number_key";

DROP INDEX IF EXISTS "document_v2_page_text_document_id_lang_page_number_key";

CREATE UNIQUE INDEX "document_v2_page_text_document_id_lang_version_page_number_key"
  ON "document_v2_page_text" ("document_id", "lang", "version", "page_number");

-- Lookup index used by the reader once it filters to current_version.
CREATE INDEX "document_v2_page_text_document_id_lang_version_idx"
  ON "document_v2_page_text" ("document_id", "lang", "version");
