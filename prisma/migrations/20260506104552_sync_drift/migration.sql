-- DropForeignKey
ALTER TABLE "_RegionToResearchDataset" DROP CONSTRAINT "_RegionToResearchDataset_A_fkey";

-- DropForeignKey
ALTER TABLE "_RegionToResearchDataset" DROP CONSTRAINT "_RegionToResearchDataset_B_fkey";

-- DropForeignKey
ALTER TABLE "dataset_resources" DROP CONSTRAINT "dataset_resources_dataset_id_fkey";

-- DropForeignKey
ALTER TABLE "document_v2_page_text" DROP CONSTRAINT "document_v2_page_text_document_id_fkey";

-- DropForeignKey
ALTER TABLE "document_v2_translations" DROP CONSTRAINT "document_v2_translations_document_id_fkey";

-- DropForeignKey
ALTER TABLE "research_datasets" DROP CONSTRAINT "research_datasets_category_id_fkey";

-- DropForeignKey
ALTER TABLE "research_datasets" DROP CONSTRAINT "research_datasets_thumbnail_id_fkey";

-- AlterTable
ALTER TABLE "dataset_resources" DROP COLUMN "dataset_id";

-- AlterTable
ALTER TABLE "documents_v2" DROP COLUMN "archive",
DROP COLUMN "current_version",
DROP COLUMN "description_i18n",
DROP COLUMN "heading_count",
DROP COLUMN "license",
DROP COLUMN "page_count",
DROP COLUMN "primary_lang",
DROP COLUMN "scans",
DROP COLUMN "title_i18n",
DROP COLUMN "year",
ADD COLUMN     "citation" TEXT,
ADD COLUMN     "date_end" TEXT,
ADD COLUMN     "date_start" TEXT,
ADD COLUMN     "excerpt_i18n" JSONB,
ADD COLUMN     "file_id" TEXT,
ADD COLUMN     "name_i18n" JSONB NOT NULL,
ADD COLUMN     "source_lang" TEXT NOT NULL,
ADD COLUMN     "toc_model" TEXT,
ADD COLUMN     "translate_model" TEXT,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "layers" ADD COLUMN     "dataset_id" UUID,
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "summary" TEXT DEFAULT '',
ADD COLUMN     "summary_i18n" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "maps" ADD COLUMN     "citation_text" TEXT,
ADD COLUMN     "citation_text_i18n" JSONB DEFAULT '{}',
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "license" TEXT,
ADD COLUMN     "maturity" "data_maturity" NOT NULL DEFAULT 'Provisional',
ADD COLUMN     "sources" TEXT,
ADD COLUMN     "sources_i18n" JSONB DEFAULT '{}',
ADD COLUMN     "summary" TEXT DEFAULT '',
ADD COLUMN     "summary_i18n" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "citation_text" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "citation_text_i18n" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "homepage_stats" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "research_team_i18n" JSONB NOT NULL DEFAULT '{}';

-- DropTable
DROP TABLE "_RegionToResearchDataset";

-- DropTable
DROP TABLE "document_v2_page_text";

-- DropTable
DROP TABLE "document_v2_translations";

-- DropTable
DROP TABLE "research_datasets";

-- CreateTable
CREATE TABLE "chapters" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "excerpt_i18n" JSONB,
    "date" TEXT,
    "mention_jews" BOOLEAN NOT NULL DEFAULT false,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_translations" (
    "id" UUID NOT NULL,
    "chapter_id" UUID NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chapter_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chapters_document_id_mention_jews_idx" ON "chapters"("document_id", "mention_jews");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_document_id_slug_key" ON "chapters"("document_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_document_id_index_key" ON "chapters"("document_id", "index");

-- CreateIndex
CREATE INDEX "chapter_translations_chapter_id_idx" ON "chapter_translations"("chapter_id");

-- CreateIndex
CREATE UNIQUE INDEX "chapter_translations_chapter_id_lang_key" ON "chapter_translations"("chapter_id", "lang");

-- CreateIndex
CREATE INDEX "layers_dataset_id_idx" ON "layers"("dataset_id");

-- CreateIndex
CREATE INDEX "maps_status_idx" ON "maps"("status");

-- AddForeignKey
ALTER TABLE "layers" ADD CONSTRAINT "layers_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "maps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_translations" ADD CONSTRAINT "chapter_translations_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

