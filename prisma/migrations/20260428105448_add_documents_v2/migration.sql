-- CreateTable
CREATE TABLE "documents_v2" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "primary_lang" TEXT NOT NULL,
    "title_i18n" JSONB NOT NULL,
    "description_i18n" JSONB,
    "year" INTEGER,
    "archive" JSONB,
    "scans" JSONB NOT NULL,
    "license" TEXT,
    "page_count" INTEGER NOT NULL DEFAULT 0,
    "heading_count" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documents_v2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_v2_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "lang" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "toc" JSONB NOT NULL,
    "markers" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_v2_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documents_v2_slug_key" ON "documents_v2"("slug");

-- CreateIndex
CREATE INDEX "documents_v2_slug_idx" ON "documents_v2"("slug");

-- CreateIndex
CREATE INDEX "documents_v2_status_idx" ON "documents_v2"("status");

-- CreateIndex
CREATE INDEX "document_v2_translations_document_id_idx" ON "document_v2_translations"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_v2_translations_document_id_lang_key" ON "document_v2_translations"("document_id", "lang");

-- AddForeignKey
ALTER TABLE "document_v2_translations" ADD CONSTRAINT "document_v2_translations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents_v2"("id") ON DELETE CASCADE ON UPDATE CASCADE;
