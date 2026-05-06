-- Consolidate redundant i18n field pairs across 17 models.
-- For each pair: DROP plain column, RENAME *_i18n → base name.
-- Backfill (previous migration 20260506140010) has already populated
-- *_i18n.he from the plain columns so no data loss occurs here.
--
-- Also: ensure all renamed columns are NOT NULL with default '{}', backfilling
-- any existing NULLs to '{}' first.

-- ============================================================================
-- Page (pages)
-- ============================================================================
ALTER TABLE "pages" DROP COLUMN "title";
UPDATE "pages" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "pages" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "pages" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "pages" DROP COLUMN "content";
UPDATE "pages" SET "content_i18n" = '{}'::jsonb WHERE "content_i18n" IS NULL;
ALTER TABLE "pages" RENAME COLUMN "content_i18n" TO "content";
ALTER TABLE "pages" ALTER COLUMN "content" SET NOT NULL, ALTER COLUMN "content" SET DEFAULT '{}';

-- ============================================================================
-- Post (posts)
-- ============================================================================
ALTER TABLE "posts" DROP COLUMN "title";
UPDATE "posts" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "posts" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "posts" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "posts" DROP COLUMN "content";
UPDATE "posts" SET "content_i18n" = '{}'::jsonb WHERE "content_i18n" IS NULL;
ALTER TABLE "posts" RENAME COLUMN "content_i18n" TO "content";
ALTER TABLE "posts" ALTER COLUMN "content" SET NOT NULL, ALTER COLUMN "content" SET DEFAULT '{}';

ALTER TABLE "posts" DROP COLUMN "excerpt";
UPDATE "posts" SET "excerpt_i18n" = '{}'::jsonb WHERE "excerpt_i18n" IS NULL;
ALTER TABLE "posts" RENAME COLUMN "excerpt_i18n" TO "excerpt";
ALTER TABLE "posts" ALTER COLUMN "excerpt" SET NOT NULL, ALTER COLUMN "excerpt" SET DEFAULT '{}';

-- ============================================================================
-- Dataset (maps)
-- ============================================================================
ALTER TABLE "maps" DROP COLUMN "title";
UPDATE "maps" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "maps" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "maps" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "maps" DROP COLUMN "description";
UPDATE "maps" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "maps" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "maps" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';

ALTER TABLE "maps" DROP COLUMN "codebook_text";
UPDATE "maps" SET "codebook_text_i18n" = '{}'::jsonb WHERE "codebook_text_i18n" IS NULL;
ALTER TABLE "maps" RENAME COLUMN "codebook_text_i18n" TO "codebook_text";
ALTER TABLE "maps" ALTER COLUMN "codebook_text" SET NOT NULL, ALTER COLUMN "codebook_text" SET DEFAULT '{}';

ALTER TABLE "maps" DROP COLUMN "summary";
UPDATE "maps" SET "summary_i18n" = '{}'::jsonb WHERE "summary_i18n" IS NULL;
ALTER TABLE "maps" RENAME COLUMN "summary_i18n" TO "summary";
ALTER TABLE "maps" ALTER COLUMN "summary" SET NOT NULL, ALTER COLUMN "summary" SET DEFAULT '{}';

ALTER TABLE "maps" DROP COLUMN "citation_text";
UPDATE "maps" SET "citation_text_i18n" = '{}'::jsonb WHERE "citation_text_i18n" IS NULL;
ALTER TABLE "maps" RENAME COLUMN "citation_text_i18n" TO "citation_text";
ALTER TABLE "maps" ALTER COLUMN "citation_text" SET NOT NULL, ALTER COLUMN "citation_text" SET DEFAULT '{}';

ALTER TABLE "maps" DROP COLUMN "sources";
UPDATE "maps" SET "sources_i18n" = '{}'::jsonb WHERE "sources_i18n" IS NULL;
ALTER TABLE "maps" RENAME COLUMN "sources_i18n" TO "sources";
ALTER TABLE "maps" ALTER COLUMN "sources" SET NOT NULL, ALTER COLUMN "sources" SET DEFAULT '{}';

-- ============================================================================
-- Layer (layers)
-- ============================================================================
ALTER TABLE "layers" DROP COLUMN "name";
UPDATE "layers" SET "name_i18n" = '{}'::jsonb WHERE "name_i18n" IS NULL;
ALTER TABLE "layers" RENAME COLUMN "name_i18n" TO "name";
ALTER TABLE "layers" ALTER COLUMN "name" SET NOT NULL, ALTER COLUMN "name" SET DEFAULT '{}';

ALTER TABLE "layers" DROP COLUMN "description";
UPDATE "layers" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "layers" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "layers" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';

ALTER TABLE "layers" DROP COLUMN "citation_text";
UPDATE "layers" SET "citation_text_i18n" = '{}'::jsonb WHERE "citation_text_i18n" IS NULL;
ALTER TABLE "layers" RENAME COLUMN "citation_text_i18n" TO "citation_text";
ALTER TABLE "layers" ALTER COLUMN "citation_text" SET NOT NULL, ALTER COLUMN "citation_text" SET DEFAULT '{}';

ALTER TABLE "layers" DROP COLUMN "codebook_text";
UPDATE "layers" SET "codebook_text_i18n" = '{}'::jsonb WHERE "codebook_text_i18n" IS NULL;
ALTER TABLE "layers" RENAME COLUMN "codebook_text_i18n" TO "codebook_text";
ALTER TABLE "layers" ALTER COLUMN "codebook_text" SET NOT NULL, ALTER COLUMN "codebook_text" SET DEFAULT '{}';

ALTER TABLE "layers" DROP COLUMN "sources";
UPDATE "layers" SET "sources_i18n" = '{}'::jsonb WHERE "sources_i18n" IS NULL;
ALTER TABLE "layers" RENAME COLUMN "sources_i18n" TO "sources";
ALTER TABLE "layers" ALTER COLUMN "sources" SET NOT NULL, ALTER COLUMN "sources" SET DEFAULT '{}';

ALTER TABLE "layers" DROP COLUMN "summary";
UPDATE "layers" SET "summary_i18n" = '{}'::jsonb WHERE "summary_i18n" IS NULL;
ALTER TABLE "layers" RENAME COLUMN "summary_i18n" TO "summary";
ALTER TABLE "layers" ALTER COLUMN "summary" SET NOT NULL, ALTER COLUMN "summary" SET DEFAULT '{}';

-- ============================================================================
-- Collection (collections)
-- ============================================================================
ALTER TABLE "collections" DROP COLUMN "name";
UPDATE "collections" SET "name_i18n" = '{}'::jsonb WHERE "name_i18n" IS NULL;
ALTER TABLE "collections" RENAME COLUMN "name_i18n" TO "name";
ALTER TABLE "collections" ALTER COLUMN "name" SET NOT NULL, ALTER COLUMN "name" SET DEFAULT '{}';

UPDATE "collections" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "collections" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "collections" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';

-- ============================================================================
-- Series (series)
-- ============================================================================
ALTER TABLE "series" DROP COLUMN "name";
UPDATE "series" SET "name_i18n" = '{}'::jsonb WHERE "name_i18n" IS NULL;
ALTER TABLE "series" RENAME COLUMN "name_i18n" TO "name";
ALTER TABLE "series" ALTER COLUMN "name" SET NOT NULL, ALTER COLUMN "name" SET DEFAULT '{}';

ALTER TABLE "series" DROP COLUMN "description";
UPDATE "series" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "series" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "series" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';

-- ============================================================================
-- Volume (volumes)
-- ============================================================================
ALTER TABLE "volumes" DROP COLUMN "title";
UPDATE "volumes" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "volumes" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "volumes" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "volumes" DROP COLUMN "description";
UPDATE "volumes" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "volumes" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "volumes" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';

-- ============================================================================
-- Artifact (artifacts)
-- ============================================================================
ALTER TABLE "artifacts" DROP COLUMN "title";
UPDATE "artifacts" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "artifacts" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "artifacts" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "artifacts" DROP COLUMN "content";
UPDATE "artifacts" SET "content_i18n" = '{}'::jsonb WHERE "content_i18n" IS NULL;
ALTER TABLE "artifacts" RENAME COLUMN "content_i18n" TO "content";
ALTER TABLE "artifacts" ALTER COLUMN "content" SET NOT NULL, ALTER COLUMN "content" SET DEFAULT '{}';

ALTER TABLE "artifacts" DROP COLUMN "excerpt";
UPDATE "artifacts" SET "excerpt_i18n" = '{}'::jsonb WHERE "excerpt_i18n" IS NULL;
ALTER TABLE "artifacts" RENAME COLUMN "excerpt_i18n" TO "excerpt";
ALTER TABLE "artifacts" ALTER COLUMN "excerpt" SET NOT NULL, ALTER COLUMN "excerpt" SET DEFAULT '{}';

ALTER TABLE "artifacts" DROP COLUMN "description";
UPDATE "artifacts" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "artifacts" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "artifacts" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';

-- ============================================================================
-- Tag (tags)
-- ============================================================================
ALTER TABLE "tags" DROP COLUMN "name";
UPDATE "tags" SET "name_i18n" = '{}'::jsonb WHERE "name_i18n" IS NULL;
ALTER TABLE "tags" RENAME COLUMN "name_i18n" TO "name";
ALTER TABLE "tags" ALTER COLUMN "name" SET NOT NULL, ALTER COLUMN "name" SET DEFAULT '{}';

-- ============================================================================
-- Region (regions)
-- ============================================================================
ALTER TABLE "regions" DROP COLUMN "name";
UPDATE "regions" SET "name_i18n" = '{}'::jsonb WHERE "name_i18n" IS NULL;
ALTER TABLE "regions" RENAME COLUMN "name_i18n" TO "name";
ALTER TABLE "regions" ALTER COLUMN "name" SET NOT NULL, ALTER COLUMN "name" SET DEFAULT '{}';

-- ============================================================================
-- Category (categories)
-- ============================================================================
ALTER TABLE "categories" DROP COLUMN "title";
UPDATE "categories" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "categories" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "categories" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

-- ============================================================================
-- ArtifactCategory (artifact_categories)
-- ============================================================================
ALTER TABLE "artifact_categories" DROP COLUMN "title";
UPDATE "artifact_categories" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "artifact_categories" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "artifact_categories" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

-- ============================================================================
-- Period (periods)
-- ============================================================================
ALTER TABLE "periods" DROP COLUMN "name";
UPDATE "periods" SET "name_i18n" = '{}'::jsonb WHERE "name_i18n" IS NULL;
ALTER TABLE "periods" RENAME COLUMN "name_i18n" TO "name";
ALTER TABLE "periods" ALTER COLUMN "name" SET NOT NULL, ALTER COLUMN "name" SET DEFAULT '{}';

-- ============================================================================
-- MenuItem (menu_items)
-- ============================================================================
ALTER TABLE "menu_items" DROP COLUMN "label";
UPDATE "menu_items" SET "label_i18n" = '{}'::jsonb WHERE "label_i18n" IS NULL;
ALTER TABLE "menu_items" RENAME COLUMN "label_i18n" TO "label";
ALTER TABLE "menu_items" ALTER COLUMN "label" SET NOT NULL, ALTER COLUMN "label" SET DEFAULT '{}';

-- ============================================================================
-- FooterColumn (footer_columns)
-- ============================================================================
ALTER TABLE "footer_columns" DROP COLUMN "title";
UPDATE "footer_columns" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "footer_columns" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "footer_columns" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "footer_columns" DROP COLUMN "content";
UPDATE "footer_columns" SET "content_i18n" = '{}'::jsonb WHERE "content_i18n" IS NULL;
ALTER TABLE "footer_columns" RENAME COLUMN "content_i18n" TO "content";
ALTER TABLE "footer_columns" ALTER COLUMN "content" SET NOT NULL, ALTER COLUMN "content" SET DEFAULT '{}';

-- ============================================================================
-- FooterColumnItem (footer_column_items)
-- ============================================================================
ALTER TABLE "footer_column_items" DROP COLUMN "label";
UPDATE "footer_column_items" SET "label_i18n" = '{}'::jsonb WHERE "label_i18n" IS NULL;
ALTER TABLE "footer_column_items" RENAME COLUMN "label_i18n" TO "label";
ALTER TABLE "footer_column_items" ALTER COLUMN "label" SET NOT NULL, ALTER COLUMN "label" SET DEFAULT '{}';

-- ============================================================================
-- SiteSettings (site_settings)
-- ============================================================================
ALTER TABLE "site_settings" DROP COLUMN "copyright_text";
ALTER TABLE "site_settings" RENAME COLUMN "copyright_i18n" TO "copyright";
ALTER TABLE "site_settings" RENAME COLUMN "research_team_i18n" TO "research_team";
ALTER TABLE "site_settings" DROP COLUMN "citation_text";
ALTER TABLE "site_settings" RENAME COLUMN "citation_text_i18n" TO "citation";

-- ============================================================================
-- SiteLink (site_links)
-- ============================================================================
ALTER TABLE "site_links" DROP COLUMN "title";
UPDATE "site_links" SET "title_i18n" = '{}'::jsonb WHERE "title_i18n" IS NULL;
ALTER TABLE "site_links" RENAME COLUMN "title_i18n" TO "title";
ALTER TABLE "site_links" ALTER COLUMN "title" SET NOT NULL, ALTER COLUMN "title" SET DEFAULT '{}';

ALTER TABLE "site_links" DROP COLUMN "description";
UPDATE "site_links" SET "description_i18n" = '{}'::jsonb WHERE "description_i18n" IS NULL;
ALTER TABLE "site_links" RENAME COLUMN "description_i18n" TO "description";
ALTER TABLE "site_links" ALTER COLUMN "description" SET NOT NULL, ALTER COLUMN "description" SET DEFAULT '{}';
