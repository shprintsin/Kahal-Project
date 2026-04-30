CREATE TABLE "document_v2_page_text" (
    "id"          UUID NOT NULL DEFAULT gen_random_uuid(),
    "document_id" UUID NOT NULL,
    "lang"        TEXT NOT NULL,
    "page_number" INTEGER NOT NULL,
    "filename"    TEXT NOT NULL,
    "text"        TEXT NOT NULL,
    "search_tsv"  TSVECTOR GENERATED ALWAYS AS (to_tsvector('simple', "text")) STORED,
    CONSTRAINT "document_v2_page_text_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "document_v2_page_text_document_id_lang_page_number_key"
    ON "document_v2_page_text"("document_id", "lang", "page_number");

CREATE INDEX "document_v2_page_text_document_id_lang_idx"
    ON "document_v2_page_text"("document_id", "lang");

CREATE INDEX "document_v2_page_text_search_tsv_idx"
    ON "document_v2_page_text" USING GIN ("search_tsv");

ALTER TABLE "document_v2_page_text"
    ADD CONSTRAINT "document_v2_page_text_document_id_fkey"
    FOREIGN KEY ("document_id") REFERENCES "documents_v2"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
