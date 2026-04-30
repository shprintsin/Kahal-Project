-- Step 3: per-language full-text search for document_v2_page_text.
--
-- Today every page is indexed with `to_tsvector('simple', text)` — language-
-- agnostic, no stemming, and broken for Hebrew (where most user queries are
-- typed without nikud against text that has nikud). This migration introduces:
--
--   * `unaccent` extension                    — diacritic folding for Polish/Russian/English
--   * `immutable_unaccent(text)`              — IMMUTABLE wrapper so it can be used in a STORED column
--   * `hebrew_normalize(text)`                — strips nikud + folds final letters + drops gershayim/maqaf
--   * `search_tsv_lang TSVECTOR GENERATED`    — per-row tsvector, dispatched by `lang`
--   * GIN index on `search_tsv_lang`
--
-- The original `search_tsv` (always built with the `simple` config) is kept
-- intact as a cross-language fallback for queries with `scope=all`.

CREATE EXTENSION IF NOT EXISTS unaccent;

-- The packaged `unaccent(text)` is STABLE (it depends on the active dictionary
-- search path), so Postgres refuses to use it in a STORED generated column.
-- The two-arg form `unaccent(dict_regname, text)` is IMMUTABLE; wrap it.
CREATE OR REPLACE FUNCTION immutable_unaccent(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT public.unaccent('public.unaccent', input)
$$;

-- Hebrew/Yiddish folding:
--   1. strip nikud + cantillation + ֿ/ׂ/ׁ (the whole ֑-ׇ block)
--   2. fold final-form letters to their non-final variants
--   3. drop gershayim / geresh / maqaf so abbreviations + dashes don't split tokens
CREATE OR REPLACE FUNCTION hebrew_normalize(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT translate(
    regexp_replace(input, '[֑-ׇ]', '', 'g'),
    'ךםןףץ׳״־',
    'כמנפצ'
  )
$$;

-- Generated column. The CASE depends only on `lang`, which never changes for
-- a row, so the value is genuinely deterministic per row.
ALTER TABLE "document_v2_page_text"
  ADD COLUMN "search_tsv_lang" TSVECTOR GENERATED ALWAYS AS (
    CASE
      WHEN "lang" = 'en' THEN to_tsvector('english', immutable_unaccent("text"))
      WHEN "lang" IN ('he', 'yi') THEN to_tsvector('simple', hebrew_normalize("text"))
      WHEN "lang" IN ('pl', 'ru') THEN to_tsvector('simple', immutable_unaccent("text"))
      ELSE to_tsvector('simple', "text")
    END
  ) STORED;

CREATE INDEX "document_v2_page_text_search_tsv_lang_idx"
  ON "document_v2_page_text" USING GIN ("search_tsv_lang");
