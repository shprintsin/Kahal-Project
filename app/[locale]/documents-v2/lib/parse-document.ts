import { z } from 'zod';
import {
  DOCUMENT_V2_LOCALES,
  DocumentV2Locale,
  isLocale,
} from '@/types/document-v2';

/**
 * Schema for the docstudio-produced JSON that ships a single archival unit
 * (one `DocumentV2`) with all its chapters and translations.
 *
 * This is the on-disk + on-the-wire shape used by the CLI and deploy API.
 * It is intentionally tolerant of missing optional metadata (Hebrew titles,
 * parent excerpts, etc.) — those start NULL in the DB and are filled in by
 * later enrichment passes.
 */

const LocaleSchema = z.enum(DOCUMENT_V2_LOCALES);

export const DocstudioChapterSchema = z.object({
  chapter_slug: z.string().min(1),
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  title_he: z.string().optional(),
  date: z.string().optional(),
  excerpt: z.string().optional(),
  excerpt_he: z.string().optional(),
  mention_jews: z.boolean().optional(),
  text: z.string(),
  // Partial record: only langs that have translations are present.
  translation: z.record(LocaleSchema, z.string().optional()).optional(),
});
export type DocstudioChapter = z.infer<typeof DocstudioChapterSchema>;

export const DocstudioDocumentSchema = z.object({
  file_id: z.string().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
  source_lang: LocaleSchema.default('pl'),
  name: z.string().min(1),
  name_he: z.string().optional(),
  original_name: z.string().optional(),
  excerpt_en: z.string().optional(),
  excerpt_he: z.string().optional(),
  citation: z.string().optional(),
  url: z.string().url().optional(),
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  toc_model: z.string().optional(),
  trans_model: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  documents: z.array(DocstudioChapterSchema).min(1),
});
export type DocstudioDocument = z.infer<typeof DocstudioDocumentSchema>;

export class DocumentV2ParseError extends Error {}

export function parseDocstudioDocument(input: unknown): DocstudioDocument {
  const result = DocstudioDocumentSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    throw new DocumentV2ParseError(`Invalid document JSON: ${issues}`);
  }

  // Chapter slugs must be unique per document so deploy can upsert by them.
  const seen = new Set<string>();
  for (const ch of result.data.documents) {
    if (seen.has(ch.chapter_slug)) {
      throw new DocumentV2ParseError(`Duplicate chapter_slug: ${ch.chapter_slug}`);
    }
    seen.add(ch.chapter_slug);
  }

  // Reject translation langs that aren't in the locale set (the Zod record
  // already filters at validation, but be loud about it).
  for (const ch of result.data.documents) {
    for (const lang of Object.keys(ch.translation ?? {})) {
      if (!isLocale(lang)) {
        throw new DocumentV2ParseError(
          `Chapter ${ch.chapter_slug} has unsupported translation lang "${lang}"`,
        );
      }
    }
  }

  return result.data;
}

/** Convenience for callers loading from disk. */
export function parseDocstudioJson(raw: string): DocstudioDocument {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new DocumentV2ParseError(`Document JSON is not valid JSON: ${(err as Error).message}`);
  }
  return parseDocstudioDocument(parsed);
}

export function buildI18nName(doc: DocstudioDocument): { en?: string; he?: string; source?: string } {
  return {
    en: doc.name,
    he: doc.name_he,
    source: doc.original_name,
  };
}

export function buildI18nExcerpt(doc: DocstudioDocument): { en?: string; he?: string } | undefined {
  if (!doc.excerpt_en && !doc.excerpt_he) return undefined;
  return { en: doc.excerpt_en, he: doc.excerpt_he };
}

export function buildI18nChapterTitle(ch: DocstudioChapter): { en?: string; he?: string } {
  return { en: ch.title, he: ch.title_he };
}

export function buildI18nChapterExcerpt(
  ch: DocstudioChapter,
): { en?: string; he?: string } | undefined {
  if (!ch.excerpt && !ch.excerpt_he) return undefined;
  return { en: ch.excerpt, he: ch.excerpt_he };
}

/** Extract non-source body translations from a chapter's `translation` map.
 *  The source-language body lives on `Chapter.text`, not in this map. */
export function extractBodyTranslations(
  ch: DocstudioChapter,
  sourceLang: DocumentV2Locale,
): Array<{ lang: DocumentV2Locale; text: string }> {
  const out: Array<{ lang: DocumentV2Locale; text: string }> = [];
  const translation = ch.translation ?? {};
  for (const [lang, text] of Object.entries(translation)) {
    if (lang === sourceLang) continue;
    if (typeof text !== 'string' || !text) continue;
    out.push({ lang: lang as DocumentV2Locale, text });
  }
  return out;
}
