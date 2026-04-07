/**
 * One-shot YAML -> JSON migration for the next-intl scaffold.
 *
 * Reads the homegrown YAML catalogs at `languages/{he,en}.yml`, strips the
 * `lang` and `isRtl` top-level keys (which are catalog metadata, not message
 * keys), and writes the result to `messages/{he,en}.json` for next-intl.
 *
 * Polish is intentionally excluded — the language scope-down decision keeps
 * Hebrew + English only. The pl.yml file stays in place but is not read.
 *
 * Run from the project root:
 *   npx tsx scripts/migrate-yaml-to-next-intl.ts
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

type MessageTree = { [key: string]: string | MessageTree };

const ROOT = path.resolve(__dirname, '..');
const LANGUAGES_DIR = path.join(ROOT, 'languages');
const MESSAGES_DIR = path.join(ROOT, 'messages');
const LOCALES = ['he', 'en'] as const;
const STRIP_KEYS = new Set(['lang', 'isRtl']);

async function loadCatalog(locale: string): Promise<MessageTree> {
  const yamlPath = path.join(LANGUAGES_DIR, `${locale}.yml`);
  const raw = await fs.readFile(yamlPath, 'utf8');
  const parsed = yaml.load(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Expected a YAML object at ${yamlPath}`);
  }
  const out: MessageTree = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (STRIP_KEYS.has(key)) continue;
    out[key] = value as string | MessageTree;
  }
  return out;
}

function collectKeyPaths(tree: MessageTree, prefix = ''): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(tree)) {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...collectKeyPaths(value as MessageTree, nextPath));
    } else {
      out.push(nextPath);
    }
  }
  return out;
}

function diffKeys(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((k) => !setB.has(k));
}

async function main(): Promise<void> {
  await fs.mkdir(MESSAGES_DIR, { recursive: true });

  const catalogs: Record<string, MessageTree> = {};
  for (const locale of LOCALES) {
    catalogs[locale] = await loadCatalog(locale);
  }

  for (const locale of LOCALES) {
    const outPath = path.join(MESSAGES_DIR, `${locale}.json`);
    await fs.writeFile(
      outPath,
      JSON.stringify(catalogs[locale], null, 2) + '\n',
      'utf8',
    );
    console.log(`wrote ${path.relative(ROOT, outPath)}`);
  }

  const heKeys = collectKeyPaths(catalogs.he);
  const enKeys = collectKeyPaths(catalogs.en);

  const missingInEn = diffKeys(heKeys, enKeys);
  const missingInHe = diffKeys(enKeys, heKeys);

  if (missingInEn.length === 0 && missingInHe.length === 0) {
    console.log('he and en catalogs have identical key sets.');
    return;
  }

  if (missingInEn.length > 0) {
    console.log(`\nKeys present in he.yml but missing in en.yml (${missingInEn.length}):`);
    for (const k of missingInEn) console.log(`  - ${k}`);
  }
  if (missingInHe.length > 0) {
    console.log(`\nKeys present in en.yml but missing in he.yml (${missingInHe.length}):`);
    for (const k of missingInHe) console.log(`  - ${k}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
