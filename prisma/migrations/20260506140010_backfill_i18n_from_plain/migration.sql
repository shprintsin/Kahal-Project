-- Backfill i18n JSON columns from their plain-text counterparts.
-- For each redundant pair, populate the JSON's `he` slot from the plain
-- column where the JSON has no he/en value yet. Idempotent: safe to re-run.
--
-- Pattern (per pair):
--   UPDATE <table> SET <col>_i18n = jsonb_set(coalesce(<col>_i18n,'{}'::jsonb), '{he}', to_jsonb(<col>))
--   WHERE <col> IS NOT NULL AND <col> NOT IN ('','Untitled')
--     AND coalesce(<col>_i18n->>'he','') = ''
--     AND coalesce(<col>_i18n->>'en','') = '';
--
-- The 'Untitled' guard exempts the Prisma `@default("Untitled")` placeholders
-- so we don't pollute every row's i18n.he with literal "Untitled".

-- ============================================================================
-- Page (pages)
-- ============================================================================
UPDATE pages SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title NOT IN ('','Untitled')
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE pages SET content_i18n = jsonb_set(coalesce(content_i18n,'{}'::jsonb),'{he}',to_jsonb(content))
  WHERE content IS NOT NULL AND content <> ''
    AND coalesce(content_i18n->>'he','') = '' AND coalesce(content_i18n->>'en','') = '';

-- ============================================================================
-- Post (posts)
-- ============================================================================
UPDATE posts SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title NOT IN ('','Untitled')
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE posts SET content_i18n = jsonb_set(coalesce(content_i18n,'{}'::jsonb),'{he}',to_jsonb(content))
  WHERE content IS NOT NULL AND content <> ''
    AND coalesce(content_i18n->>'he','') = '' AND coalesce(content_i18n->>'en','') = '';

UPDATE posts SET excerpt_i18n = jsonb_set(coalesce(excerpt_i18n,'{}'::jsonb),'{he}',to_jsonb(excerpt))
  WHERE excerpt IS NOT NULL AND excerpt <> ''
    AND coalesce(excerpt_i18n->>'he','') = '' AND coalesce(excerpt_i18n->>'en','') = '';

-- ============================================================================
-- Dataset (maps)
-- ============================================================================
UPDATE maps SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title NOT IN ('','Untitled')
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE maps SET description_i18n = jsonb_set(coalesce(description_i18n,'{}'::jsonb),'{he}',to_jsonb(description))
  WHERE description IS NOT NULL AND description <> ''
    AND coalesce(description_i18n->>'he','') = '' AND coalesce(description_i18n->>'en','') = '';

UPDATE maps SET codebook_text_i18n = jsonb_set(coalesce(codebook_text_i18n,'{}'::jsonb),'{he}',to_jsonb(codebook_text))
  WHERE codebook_text IS NOT NULL AND codebook_text <> ''
    AND coalesce(codebook_text_i18n->>'he','') = '' AND coalesce(codebook_text_i18n->>'en','') = '';

UPDATE maps SET summary_i18n = jsonb_set(coalesce(summary_i18n,'{}'::jsonb),'{he}',to_jsonb(summary))
  WHERE summary IS NOT NULL AND summary <> ''
    AND coalesce(summary_i18n->>'he','') = '' AND coalesce(summary_i18n->>'en','') = '';

UPDATE maps SET citation_text_i18n = jsonb_set(coalesce(citation_text_i18n,'{}'::jsonb),'{he}',to_jsonb(citation_text))
  WHERE citation_text IS NOT NULL AND citation_text <> ''
    AND coalesce(citation_text_i18n->>'he','') = '' AND coalesce(citation_text_i18n->>'en','') = '';

UPDATE maps SET sources_i18n = jsonb_set(coalesce(sources_i18n,'{}'::jsonb),'{he}',to_jsonb(sources))
  WHERE sources IS NOT NULL AND sources <> ''
    AND coalesce(sources_i18n->>'he','') = '' AND coalesce(sources_i18n->>'en','') = '';

-- ============================================================================
-- Layer (layers)
-- ============================================================================
UPDATE layers SET name_i18n = jsonb_set(coalesce(name_i18n,'{}'::jsonb),'{he}',to_jsonb(name))
  WHERE name IS NOT NULL AND name NOT IN ('','Untitled')
    AND coalesce(name_i18n->>'he','') = '' AND coalesce(name_i18n->>'en','') = '';

UPDATE layers SET description_i18n = jsonb_set(coalesce(description_i18n,'{}'::jsonb),'{he}',to_jsonb(description))
  WHERE description IS NOT NULL AND description <> ''
    AND coalesce(description_i18n->>'he','') = '' AND coalesce(description_i18n->>'en','') = '';

UPDATE layers SET citation_text_i18n = jsonb_set(coalesce(citation_text_i18n,'{}'::jsonb),'{he}',to_jsonb(citation_text))
  WHERE citation_text IS NOT NULL AND citation_text <> ''
    AND coalesce(citation_text_i18n->>'he','') = '' AND coalesce(citation_text_i18n->>'en','') = '';

UPDATE layers SET codebook_text_i18n = jsonb_set(coalesce(codebook_text_i18n,'{}'::jsonb),'{he}',to_jsonb(codebook_text))
  WHERE codebook_text IS NOT NULL AND codebook_text <> ''
    AND coalesce(codebook_text_i18n->>'he','') = '' AND coalesce(codebook_text_i18n->>'en','') = '';

UPDATE layers SET sources_i18n = jsonb_set(coalesce(sources_i18n,'{}'::jsonb),'{he}',to_jsonb(sources))
  WHERE sources IS NOT NULL AND sources <> ''
    AND coalesce(sources_i18n->>'he','') = '' AND coalesce(sources_i18n->>'en','') = '';

UPDATE layers SET summary_i18n = jsonb_set(coalesce(summary_i18n,'{}'::jsonb),'{he}',to_jsonb(summary))
  WHERE summary IS NOT NULL AND summary <> ''
    AND coalesce(summary_i18n->>'he','') = '' AND coalesce(summary_i18n->>'en','') = '';

-- ============================================================================
-- Collection (collections)
-- ============================================================================
UPDATE collections SET name_i18n = jsonb_set(coalesce(name_i18n,'{}'::jsonb),'{he}',to_jsonb(name))
  WHERE name IS NOT NULL AND name NOT IN ('','Untitled')
    AND coalesce(name_i18n->>'he','') = '' AND coalesce(name_i18n->>'en','') = '';

-- ============================================================================
-- Series (series)
-- ============================================================================
UPDATE series SET name_i18n = jsonb_set(coalesce(name_i18n,'{}'::jsonb),'{he}',to_jsonb(name))
  WHERE name IS NOT NULL AND name NOT IN ('','Untitled')
    AND coalesce(name_i18n->>'he','') = '' AND coalesce(name_i18n->>'en','') = '';

UPDATE series SET description_i18n = jsonb_set(coalesce(description_i18n,'{}'::jsonb),'{he}',to_jsonb(description))
  WHERE description IS NOT NULL AND description <> ''
    AND coalesce(description_i18n->>'he','') = '' AND coalesce(description_i18n->>'en','') = '';

-- ============================================================================
-- Volume (volumes)
-- ============================================================================
UPDATE volumes SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title NOT IN ('','Untitled')
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE volumes SET description_i18n = jsonb_set(coalesce(description_i18n,'{}'::jsonb),'{he}',to_jsonb(description))
  WHERE description IS NOT NULL AND description <> ''
    AND coalesce(description_i18n->>'he','') = '' AND coalesce(description_i18n->>'en','') = '';

-- ============================================================================
-- Artifact (artifacts)
-- ============================================================================
UPDATE artifacts SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title <> ''
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE artifacts SET content_i18n = jsonb_set(coalesce(content_i18n,'{}'::jsonb),'{he}',to_jsonb(content))
  WHERE content IS NOT NULL AND content <> ''
    AND coalesce(content_i18n->>'he','') = '' AND coalesce(content_i18n->>'en','') = '';

UPDATE artifacts SET excerpt_i18n = jsonb_set(coalesce(excerpt_i18n,'{}'::jsonb),'{he}',to_jsonb(excerpt))
  WHERE excerpt IS NOT NULL AND excerpt <> ''
    AND coalesce(excerpt_i18n->>'he','') = '' AND coalesce(excerpt_i18n->>'en','') = '';

UPDATE artifacts SET description_i18n = jsonb_set(coalesce(description_i18n,'{}'::jsonb),'{he}',to_jsonb(description))
  WHERE description IS NOT NULL AND description <> ''
    AND coalesce(description_i18n->>'he','') = '' AND coalesce(description_i18n->>'en','') = '';

-- ============================================================================
-- Tag (tags)
-- ============================================================================
UPDATE tags SET name_i18n = jsonb_set(coalesce(name_i18n,'{}'::jsonb),'{he}',to_jsonb(name))
  WHERE name IS NOT NULL AND name NOT IN ('','Untitled')
    AND coalesce(name_i18n->>'he','') = '' AND coalesce(name_i18n->>'en','') = '';

-- ============================================================================
-- Region (regions)
-- ============================================================================
UPDATE regions SET name_i18n = jsonb_set(coalesce(name_i18n,'{}'::jsonb),'{he}',to_jsonb(name))
  WHERE name IS NOT NULL AND name NOT IN ('','Untitled')
    AND coalesce(name_i18n->>'he','') = '' AND coalesce(name_i18n->>'en','') = '';

-- ============================================================================
-- Category (categories)
-- ============================================================================
UPDATE categories SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title <> ''
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

-- ============================================================================
-- ArtifactCategory (artifact_categories)
-- ============================================================================
UPDATE artifact_categories SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title NOT IN ('','Untitled')
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

-- ============================================================================
-- Period (periods)
-- ============================================================================
UPDATE periods SET name_i18n = jsonb_set(coalesce(name_i18n,'{}'::jsonb),'{he}',to_jsonb(name))
  WHERE name IS NOT NULL AND name NOT IN ('','Untitled')
    AND coalesce(name_i18n->>'he','') = '' AND coalesce(name_i18n->>'en','') = '';

-- ============================================================================
-- MenuItem (menu_items)
-- ============================================================================
UPDATE menu_items SET label_i18n = jsonb_set(coalesce(label_i18n,'{}'::jsonb),'{he}',to_jsonb(label))
  WHERE label IS NOT NULL AND label <> ''
    AND coalesce(label_i18n->>'he','') = '' AND coalesce(label_i18n->>'en','') = '';

-- ============================================================================
-- FooterColumn (footer_columns)
-- ============================================================================
UPDATE footer_columns SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title <> ''
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE footer_columns SET content_i18n = jsonb_set(coalesce(content_i18n,'{}'::jsonb),'{he}',to_jsonb(content))
  WHERE content IS NOT NULL AND content <> ''
    AND coalesce(content_i18n->>'he','') = '' AND coalesce(content_i18n->>'en','') = '';

-- ============================================================================
-- FooterColumnItem (footer_column_items)
-- ============================================================================
UPDATE footer_column_items SET label_i18n = jsonb_set(coalesce(label_i18n,'{}'::jsonb),'{he}',to_jsonb(label))
  WHERE label IS NOT NULL AND label <> ''
    AND coalesce(label_i18n->>'he','') = '' AND coalesce(label_i18n->>'en','') = '';

-- ============================================================================
-- SiteSettings (site_settings)
-- ============================================================================
UPDATE site_settings SET copyright_i18n = jsonb_set(coalesce(copyright_i18n,'{}'::jsonb),'{he}',to_jsonb(copyright_text))
  WHERE copyright_text IS NOT NULL AND copyright_text <> ''
    AND coalesce(copyright_i18n->>'he','') = '' AND coalesce(copyright_i18n->>'en','') = '';

UPDATE site_settings SET citation_text_i18n = jsonb_set(coalesce(citation_text_i18n,'{}'::jsonb),'{he}',to_jsonb(citation_text))
  WHERE citation_text IS NOT NULL AND citation_text <> ''
    AND coalesce(citation_text_i18n->>'he','') = '' AND coalesce(citation_text_i18n->>'en','') = '';

-- ============================================================================
-- SiteLink (site_links)
-- ============================================================================
UPDATE site_links SET title_i18n = jsonb_set(coalesce(title_i18n,'{}'::jsonb),'{he}',to_jsonb(title))
  WHERE title IS NOT NULL AND title <> ''
    AND coalesce(title_i18n->>'he','') = '' AND coalesce(title_i18n->>'en','') = '';

UPDATE site_links SET description_i18n = jsonb_set(coalesce(description_i18n,'{}'::jsonb),'{he}',to_jsonb(description))
  WHERE description IS NOT NULL AND description <> ''
    AND coalesce(description_i18n->>'he','') = '' AND coalesce(description_i18n->>'en','') = '';
