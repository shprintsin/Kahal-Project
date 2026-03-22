/*
  Warnings:

  - You are about to drop the column `geom` on the `layers` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_layers_geom";

-- AlterTable
ALTER TABLE "dataset_resources" ADD COLUMN     "size_bytes" INTEGER;

-- AlterTable
ALTER TABLE "layers" DROP COLUMN "geom";

-- AlterTable
ALTER TABLE "map_deployments" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "maps" ADD COLUMN     "codebook_text" TEXT,
ADD COLUMN     "codebook_text_i18n" JSONB DEFAULT '{}';

-- CreateTable
CREATE TABLE "site_links" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "title_i18n" JSONB NOT NULL DEFAULT '{}',
    "description" TEXT,
    "description_i18n" JSONB DEFAULT '{}',
    "icon" TEXT,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "site_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_links_status_order_idx" ON "site_links"("status", "order");
