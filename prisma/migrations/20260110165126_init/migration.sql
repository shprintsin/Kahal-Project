-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('ADMIN', 'EDITOR', 'CONTRIBUTOR');

-- CreateEnum
CREATE TYPE "content_language" AS ENUM ('PL', 'HE', 'EN', 'YD', 'RS', 'LIT', 'LAT', 'DE', 'NA');

-- CreateEnum
CREATE TYPE "app_language" AS ENUM ('PL', 'HE', 'EN');

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('draft', 'published', 'archived', 'changes_requested');

-- CreateEnum
CREATE TYPE "ResouceType" AS ENUM ('XLSX', 'CSV', 'JSON', 'PDF', 'HTML', 'DOCX', 'ZIP', 'TXT', 'XLS', 'PNG', 'JPG', 'TIFF', 'URL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "data_maturity" AS ENUM ('Raw', 'Preliminary', 'Provisional', 'Validated');

-- CreateEnum
CREATE TYPE "LayerType" AS ENUM ('POINTS', 'POLYGONS', 'POLYLINES', 'MULTI_POLYGONS', 'RASTER');

-- CreateEnum
CREATE TYPE "layer_source_type" AS ENUM ('url', 'database', 'inline');

-- CreateEnum
CREATE TYPE "TextType" AS ENUM ('TRANSCRIPTION', 'TRANSLATION');

-- CreateEnum
CREATE TYPE "ImageUseType" AS ENUM ('original_scan', 'thumbnail', 'crop');

-- CreateEnum
CREATE TYPE "item_variant" AS ENUM ('DEFAULT', 'BUTTON_SOLID', 'BUTTON_OUTLINE', 'CARD');

-- CreateEnum
CREATE TYPE "menu_type" AS ENUM ('LINK_LIST', 'RICH_TEXT');

-- CreateEnum
CREATE TYPE "menu_location" AS ENUM ('HEADER', 'HERO_GRID', 'HERO_ACTIONS', 'HERO_STRIP', 'FOOTER');

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "sources" TEXT,
    "citations" TEXT,
    "language" "app_language" NOT NULL DEFAULT 'HE',
    "translation_group_id" UUID,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "author_id" UUID,
    "parent_id" UUID,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "thumbnail_id" UUID,
    "template" TEXT DEFAULT 'default',
    "menu_order" INTEGER NOT NULL DEFAULT 0,
    "show_in_menu" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" UUID NOT NULL,
    "translation_group_id" UUID NOT NULL,
    "language" "app_language" NOT NULL DEFAULT 'HE',
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "sources" TEXT,
    "excerpt" TEXT,
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "author_id" UUID,
    "thumbnail_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "post_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'CONTRIBUTOR',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "research_datasets" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title_i18n" JSONB DEFAULT '{}',
    "codebook_text_i18n" JSONB DEFAULT '{}',
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "maturity" "data_maturity" NOT NULL DEFAULT 'Provisional',
    "version" TEXT DEFAULT '1.0.0',
    "license" TEXT,
    "thumbnail_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT DEFAULT '',
    "title" TEXT NOT NULL DEFAULT 'Untitled Dataset',
    "category_id" UUID,
    "citationText" TEXT,
    "codebookText" TEXT,
    "max_year" INTEGER,
    "min_year" INTEGER,
    "sources" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "sources_i18n" JSONB DEFAULT '{}',
    "description_i18n" JSONB DEFAULT '{}',

    CONSTRAINT "research_datasets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dataset_resources" (
    "id" UUID NOT NULL,
    "dataset_id" UUID,
    "url" TEXT NOT NULL,
    "is_main_file" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "format" "ResouceType" NOT NULL DEFAULT 'UNKNOWN',
    "filename" TEXT,
    "mimeType" TEXT,
    "excerpt_i18n" JSONB DEFAULT '{}',
    "map_id" UUID,

    CONSTRAINT "dataset_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maps" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title_i18n" JSONB DEFAULT '{}',
    "description_i18n" JSONB DEFAULT '{}',
    "year" INTEGER,
    "version" TEXT DEFAULT '1.0.0',
    "thumbnail_id" UUID,
    "config" JSONB DEFAULT '{}',
    "global_style_config" JSONB DEFAULT '{}',
    "reference_links" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "description" TEXT,
    "period" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "year_max" INTEGER,
    "year_min" INTEGER,
    "category_id" UUID,
    "status" "content_status" NOT NULL DEFAULT 'draft',

    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "layers" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "name_i18n" JSONB DEFAULT '{}',
    "description" TEXT DEFAULT '',
    "description_i18n" JSONB DEFAULT '{}',
    "filename" TEXT DEFAULT '',
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "version" TEXT DEFAULT '1.0.0',
    "category_id" UUID,
    "type" "LayerType" NOT NULL DEFAULT 'POINTS',
    "citation_text" TEXT,
    "citation_text_i18n" JSONB DEFAULT '{}',
    "codebook_text" TEXT,
    "codebook_text_i18n" JSONB DEFAULT '{}',
    "sources" TEXT,
    "sources_i18n" JSONB DEFAULT '{}',
    "license" TEXT,
    "maturity" "data_maturity" NOT NULL DEFAULT 'Provisional',
    "min_year" INTEGER,
    "max_year" INTEGER,
    "source_type" "layer_source_type" NOT NULL DEFAULT 'database',
    "source_url" TEXT,
    "download_url" TEXT,
    "geojson_data" JSONB,
    "style_config" JSONB NOT NULL DEFAULT '{}',
    "thumbnail" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_layer_associations" (
    "id" UUID NOT NULL,
    "map_id" UUID NOT NULL,
    "layer_id" UUID NOT NULL,
    "z_index" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_visible_by_default" BOOLEAN NOT NULL DEFAULT true,
    "style_override" JSONB,
    "interaction_config" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "map_layer_associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" UUID NOT NULL,
    "name_i18n" JSONB NOT NULL DEFAULT '{}',
    "description_i18n" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thumbnail_id" UUID,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "reference_code" TEXT,
    "year_max" INTEGER,
    "year_min" INTEGER,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" UUID NOT NULL,
    "collection_id" UUID,
    "name_i18n" JSONB NOT NULL DEFAULT '{}',
    "description_i18n" JSONB DEFAULT '{}',
    "index_number" INTEGER,
    "volume_label_format" TEXT,
    "thumbnail_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "description" TEXT,
    "license" TEXT,
    "period" TEXT,
    "source_link" TEXT,
    "sources" TEXT,
    "author" TEXT,
    "editor" TEXT,
    "reference_code" TEXT,
    "year_max" INTEGER,
    "year_min" INTEGER,
    "languages" "content_language"[],

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volumes" (
    "id" UUID NOT NULL,
    "series_id" UUID,
    "index_number" INTEGER,
    "title_i18n" JSONB NOT NULL DEFAULT '{}',
    "description_i18n" JSONB DEFAULT '{}',
    "language_of_content" TEXT,
    "year_content" INTEGER,
    "thumbnail_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "description" TEXT,
    "license" TEXT,
    "source_link" TEXT,
    "sources" TEXT,
    "year" INTEGER,
    "author" TEXT,
    "editor" TEXT,
    "languages" "content_language"[],
    "year_max" INTEGER,
    "year_min" INTEGER,

    CONSTRAINT "volumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volume_pages" (
    "id" UUID NOT NULL,
    "volume_id" UUID,
    "sequence_index" INTEGER NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "volume_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifacts" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "content_i18n" JSONB NOT NULL DEFAULT '{}',
    "year" INTEGER,
    "date_display" TEXT,
    "date_sort" TIMESTAMP(3),
    "excerpt" TEXT,
    "excerpt_i18n" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "description_i18n" JSONB DEFAULT '{}',
    "display_scans" BOOLEAN NOT NULL DEFAULT true,
    "display_texts" BOOLEAN NOT NULL DEFAULT true,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "title" TEXT NOT NULL DEFAULT '',
    "title_i18n" JSONB NOT NULL DEFAULT '{}',
    "artifact_category_id" UUID,

    CONSTRAINT "artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_texts" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "type" "TextType" NOT NULL DEFAULT 'TRANSCRIPTION',
    "language" "app_language" NOT NULL,
    "text_accuracy" INTEGER,
    "contributor_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_texts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_data" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "ocr_data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_images" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "storage_file_id" UUID NOT NULL,
    "use_type" "ImageUseType" NOT NULL DEFAULT 'original_scan',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_files" (
    "id" UUID NOT NULL,
    "bucket_name" TEXT NOT NULL DEFAULT 'kahal',
    "storage_key" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT,
    "size_bytes" DOUBLE PRECISION,
    "hash_etag" TEXT,
    "public_url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "storage_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storage_file_id" UUID,
    "alt_text_i18n" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "places" (
    "id" UUID NOT NULL,
    "geoname" TEXT NOT NULL,
    "geocode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "country_code" TEXT NOT NULL,
    "admin1" TEXT,
    "admin2" TEXT,

    CONSTRAINT "places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrative_places" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "year" TEXT,
    "source" TEXT,
    "admin1" TEXT,
    "admin2" TEXT,
    "jewish_pop" INTEGER,
    "total_pop" INTEGER,
    "place_id" UUID,

    CONSTRAINT "administrative_places_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name_i18n" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL DEFAULT 'Untitled',

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "name_i18n" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnail_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title_i18n" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artifact_categories" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled',
    "title_i18n" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artifact_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periods" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Untitled',
    "name_i18n" JSONB NOT NULL DEFAULT '{}',
    "date_start" TIMESTAMPTZ(6),
    "date_end" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menus" (
    "id" UUID NOT NULL,
    "location" "menu_location" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" UUID NOT NULL,
    "menu_id" UUID NOT NULL,
    "parent_id" UUID,
    "label" TEXT NOT NULL DEFAULT '',
    "label_i18n" JSONB NOT NULL DEFAULT '{}',
    "icon" TEXT,
    "variant" "item_variant" NOT NULL DEFAULT 'DEFAULT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "page_id" UUID,
    "url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_columns" (
    "id" UUID NOT NULL,
    "type" "menu_type" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL DEFAULT '',
    "title_i18n" JSONB NOT NULL DEFAULT '{}',
    "content" TEXT DEFAULT '',
    "content_i18n" JSONB DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "footer_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_column_items" (
    "id" UUID NOT NULL,
    "footer_column_id" UUID NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "label_i18n" JSONB NOT NULL DEFAULT '{}',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "page_id" UUID,
    "url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "footer_column_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "copyright_text" TEXT NOT NULL DEFAULT '',
    "copyright_i18n" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_en" TEXT,
    "description" TEXT,
    "description_en" TEXT,
    "category" TEXT,
    "year" INTEGER,
    "reference" TEXT,
    "reference_url" TEXT,
    "scan_url" TEXT,
    "scan_zip" TEXT,
    "lang" "content_language" NOT NULL DEFAULT 'PL',
    "status" "content_status" NOT NULL DEFAULT 'draft',
    "license" TEXT,
    "volume" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_pages" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "contentHe" TEXT,
    "contentEn" TEXT,
    "filename" TEXT,
    "bookmark" TEXT,
    "highlights" JSONB DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PageToRegion" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PageToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PageToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PageToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PostToRegion" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_PostToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MapToRegion" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MapToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MapToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_MapToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LayerToRegion" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_LayerToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_LayerToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_LayerToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionToRegion" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CollectionToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CollectionToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CollectionToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SeriesToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_SeriesToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArtifactToPeriod" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArtifactToPeriod_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArtifactToPlace" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArtifactToPlace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArtifactToRegion" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArtifactToRegion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArtifactToTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArtifactToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ArtifactToVolumePage" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ArtifactToVolumePage_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RegionToResearchDataset" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RegionToResearchDataset_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RegionToSeries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RegionToSeries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_RegionToVolume" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_RegionToVolume_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryToPost" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoryToPost_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CategoryToSeries" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_CategoryToSeries_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_translation_group_id_idx" ON "pages"("translation_group_id");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE INDEX "posts_translation_group_id_idx" ON "posts"("translation_group_id");

-- CreateIndex
CREATE INDEX "posts_status_idx" ON "posts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "research_datasets_slug_key" ON "research_datasets"("slug");

-- CreateIndex
CREATE INDEX "research_datasets_status_idx" ON "research_datasets"("status");

-- CreateIndex
CREATE UNIQUE INDEX "dataset_resources_slug_key" ON "dataset_resources"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "maps_slug_key" ON "maps"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "layers_slug_key" ON "layers"("slug");

-- CreateIndex
CREATE INDEX "layers_status_idx" ON "layers"("status");

-- CreateIndex
CREATE INDEX "layers_category_id_idx" ON "layers"("category_id");

-- CreateIndex
CREATE INDEX "map_layer_associations_map_id_idx" ON "map_layer_associations"("map_id");

-- CreateIndex
CREATE INDEX "map_layer_associations_layer_id_idx" ON "map_layer_associations"("layer_id");

-- CreateIndex
CREATE UNIQUE INDEX "map_layer_associations_map_id_layer_id_key" ON "map_layer_associations"("map_id", "layer_id");

-- CreateIndex
CREATE UNIQUE INDEX "series_slug_key" ON "series"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "volumes_slug_key" ON "volumes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "artifacts_slug_key" ON "artifacts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "page_data_page_id_key" ON "page_data"("page_id");

-- CreateIndex
CREATE UNIQUE INDEX "storage_files_storage_key_key" ON "storage_files"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "places_geoname_key" ON "places"("geoname");

-- CreateIndex
CREATE UNIQUE INDEX "places_geocode_key" ON "places"("geocode");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "regions_slug_key" ON "regions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "artifact_categories_slug_key" ON "artifact_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "periods_slug_key" ON "periods"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "menus_location_key" ON "menus"("location");

-- CreateIndex
CREATE INDEX "menu_items_menu_id_order_idx" ON "menu_items"("menu_id", "order");

-- CreateIndex
CREATE INDEX "menu_items_parent_id_idx" ON "menu_items"("parent_id");

-- CreateIndex
CREATE INDEX "footer_column_items_footer_column_id_order_idx" ON "footer_column_items"("footer_column_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_key_key" ON "site_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "documents_slug_key" ON "documents"("slug");

-- CreateIndex
CREATE INDEX "documents_slug_idx" ON "documents"("slug");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "document_pages_document_id_idx" ON "document_pages"("document_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_pages_document_id_index_key" ON "document_pages"("document_id", "index");

-- CreateIndex
CREATE INDEX "_PageToRegion_B_index" ON "_PageToRegion"("B");

-- CreateIndex
CREATE INDEX "_PageToTag_B_index" ON "_PageToTag"("B");

-- CreateIndex
CREATE INDEX "_PostToRegion_B_index" ON "_PostToRegion"("B");

-- CreateIndex
CREATE INDEX "_MapToRegion_B_index" ON "_MapToRegion"("B");

-- CreateIndex
CREATE INDEX "_MapToTag_B_index" ON "_MapToTag"("B");

-- CreateIndex
CREATE INDEX "_LayerToRegion_B_index" ON "_LayerToRegion"("B");

-- CreateIndex
CREATE INDEX "_LayerToTag_B_index" ON "_LayerToTag"("B");

-- CreateIndex
CREATE INDEX "_CollectionToRegion_B_index" ON "_CollectionToRegion"("B");

-- CreateIndex
CREATE INDEX "_CollectionToTag_B_index" ON "_CollectionToTag"("B");

-- CreateIndex
CREATE INDEX "_SeriesToTag_B_index" ON "_SeriesToTag"("B");

-- CreateIndex
CREATE INDEX "_ArtifactToPeriod_B_index" ON "_ArtifactToPeriod"("B");

-- CreateIndex
CREATE INDEX "_ArtifactToPlace_B_index" ON "_ArtifactToPlace"("B");

-- CreateIndex
CREATE INDEX "_ArtifactToRegion_B_index" ON "_ArtifactToRegion"("B");

-- CreateIndex
CREATE INDEX "_ArtifactToTag_B_index" ON "_ArtifactToTag"("B");

-- CreateIndex
CREATE INDEX "_ArtifactToVolumePage_B_index" ON "_ArtifactToVolumePage"("B");

-- CreateIndex
CREATE INDEX "_RegionToResearchDataset_B_index" ON "_RegionToResearchDataset"("B");

-- CreateIndex
CREATE INDEX "_RegionToSeries_B_index" ON "_RegionToSeries"("B");

-- CreateIndex
CREATE INDEX "_RegionToVolume_B_index" ON "_RegionToVolume"("B");

-- CreateIndex
CREATE INDEX "_CategoryToPost_B_index" ON "_CategoryToPost"("B");

-- CreateIndex
CREATE INDEX "_CategoryToSeries_B_index" ON "_CategoryToSeries"("B");

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_datasets" ADD CONSTRAINT "research_datasets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "research_datasets" ADD CONSTRAINT "research_datasets_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_resources" ADD CONSTRAINT "dataset_resources_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "research_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dataset_resources" ADD CONSTRAINT "dataset_resources_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maps" ADD CONSTRAINT "maps_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maps" ADD CONSTRAINT "maps_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "layers" ADD CONSTRAINT "layers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_layer_associations" ADD CONSTRAINT "map_layer_associations_layer_id_fkey" FOREIGN KEY ("layer_id") REFERENCES "layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_layer_associations" ADD CONSTRAINT "map_layer_associations_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volumes" ADD CONSTRAINT "volumes_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volumes" ADD CONSTRAINT "volumes_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_pages" ADD CONSTRAINT "volume_pages_volume_id_fkey" FOREIGN KEY ("volume_id") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artifacts" ADD CONSTRAINT "artifacts_artifact_category_id_fkey" FOREIGN KEY ("artifact_category_id") REFERENCES "artifact_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_texts" ADD CONSTRAINT "page_texts_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "volume_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_data" ADD CONSTRAINT "page_data_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "volume_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_images" ADD CONSTRAINT "page_images_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "volume_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_images" ADD CONSTRAINT "page_images_storage_file_id_fkey" FOREIGN KEY ("storage_file_id") REFERENCES "storage_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_storage_file_id_fkey" FOREIGN KEY ("storage_file_id") REFERENCES "storage_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrative_places" ADD CONSTRAINT "administrative_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_thumbnail_id_fkey" FOREIGN KEY ("thumbnail_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_column_items" ADD CONSTRAINT "footer_column_items_footer_column_id_fkey" FOREIGN KEY ("footer_column_id") REFERENCES "footer_columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "footer_column_items" ADD CONSTRAINT "footer_column_items_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_pages" ADD CONSTRAINT "document_pages_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToRegion" ADD CONSTRAINT "_PageToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToRegion" ADD CONSTRAINT "_PageToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToTag" ADD CONSTRAINT "_PageToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PageToTag" ADD CONSTRAINT "_PageToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToRegion" ADD CONSTRAINT "_PostToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToRegion" ADD CONSTRAINT "_PostToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MapToRegion" ADD CONSTRAINT "_MapToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MapToRegion" ADD CONSTRAINT "_MapToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MapToTag" ADD CONSTRAINT "_MapToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MapToTag" ADD CONSTRAINT "_MapToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LayerToRegion" ADD CONSTRAINT "_LayerToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LayerToRegion" ADD CONSTRAINT "_LayerToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LayerToTag" ADD CONSTRAINT "_LayerToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "layers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LayerToTag" ADD CONSTRAINT "_LayerToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToRegion" ADD CONSTRAINT "_CollectionToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToRegion" ADD CONSTRAINT "_CollectionToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToTag" ADD CONSTRAINT "_CollectionToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToTag" ADD CONSTRAINT "_CollectionToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeriesToTag" ADD CONSTRAINT "_SeriesToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SeriesToTag" ADD CONSTRAINT "_SeriesToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToPeriod" ADD CONSTRAINT "_ArtifactToPeriod_A_fkey" FOREIGN KEY ("A") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToPeriod" ADD CONSTRAINT "_ArtifactToPeriod_B_fkey" FOREIGN KEY ("B") REFERENCES "periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToPlace" ADD CONSTRAINT "_ArtifactToPlace_A_fkey" FOREIGN KEY ("A") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToPlace" ADD CONSTRAINT "_ArtifactToPlace_B_fkey" FOREIGN KEY ("B") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToRegion" ADD CONSTRAINT "_ArtifactToRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToRegion" ADD CONSTRAINT "_ArtifactToRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToTag" ADD CONSTRAINT "_ArtifactToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToTag" ADD CONSTRAINT "_ArtifactToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToVolumePage" ADD CONSTRAINT "_ArtifactToVolumePage_A_fkey" FOREIGN KEY ("A") REFERENCES "artifacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtifactToVolumePage" ADD CONSTRAINT "_ArtifactToVolumePage_B_fkey" FOREIGN KEY ("B") REFERENCES "volume_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToResearchDataset" ADD CONSTRAINT "_RegionToResearchDataset_A_fkey" FOREIGN KEY ("A") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToResearchDataset" ADD CONSTRAINT "_RegionToResearchDataset_B_fkey" FOREIGN KEY ("B") REFERENCES "research_datasets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToSeries" ADD CONSTRAINT "_RegionToSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToSeries" ADD CONSTRAINT "_RegionToSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToVolume" ADD CONSTRAINT "_RegionToVolume_A_fkey" FOREIGN KEY ("A") REFERENCES "regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RegionToVolume" ADD CONSTRAINT "_RegionToVolume_B_fkey" FOREIGN KEY ("B") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPost" ADD CONSTRAINT "_CategoryToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToSeries" ADD CONSTRAINT "_CategoryToSeries_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToSeries" ADD CONSTRAINT "_CategoryToSeries_B_fkey" FOREIGN KEY ("B") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;
