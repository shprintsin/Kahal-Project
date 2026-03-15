# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
npm run build                    # prisma generate + next build

# Test
npm test                         # vitest in watch mode
npm run test:run                 # single run (CI)
npm run test:run -- path/to/file # run a single test file
npm run test:coverage            # with coverage report

# Lint
npm run lint                     # eslint (flat config, v9)

# Database
npm run db:generate              # regenerate Prisma client
npm run db:push                  # push schema to DB (no migration)
npm run db:migrate               # create + apply migration
npm run db:studio                # open Prisma Studio GUI
```

Tests use Vitest + jsdom + React Testing Library. Path alias `@/*` maps to project root. Test files live alongside source as `__tests__/*.test.{ts,tsx}`.

## Architecture

**Next.js 16 App Router** — single unified app serving both the public site and admin CMS.

### Content Type System (CMS)

The admin panel uses a **declarative content type registry** (`app/admin/system/content-type-registry.ts`):

- Content types are registered in `app/admin/system/content-types/` (article, post, page, dataset, period, place, region, category, tag)
- Each content type declares fields via `createField.*()` helpers — these generate both the editor UI and Zod validation schemas from a single definition
- Field types: text, textarea, markdown, slug, number, date, boolean, status, select, relation, relation-many, thumbnail, files, translatable, json

### Data Flow Pattern

- **Server actions** (`app/admin/actions/`) handle all admin CRUD — pattern: `get*()`, `create*()`, `update*()`, `delete*()` with `revalidatePath()` for cache
- **API routes** (`app/api/`) serve REST endpoints for the public site
- **`lib/api.ts`** — client-side fetch wrapper used by public pages (60s revalidate)

### Component Organization

| Location | Purpose |
|---|---|
| `components/ui/` | shadcn/ui primitives + custom site-wide components |
| `app/components/` | Public-facing feature components (homepage, layout, pages) |
| `app/admin/components/` | Admin CMS UI (editors, tables, dialogs) |
| `components/map-components/` | Map visualization controls |
| `components/admin-menus/` | Menu management |

### Key Subsystems

- **Maps/Layers** — Leaflet + react-leaflet. Map config stored as JSON in DB. Layers have source types (URL, database, inline GeoJSON). Utilities in `lib/mapUtils.ts`
- **i18n** — JSON fields per model (e.g., `titleI18n: { en, pl, he }`). Translation helpers in `lib/i18n/`
- **Auth** — next-auth v5 beta with JWT strategy, Credentials provider, bcryptjs. Config in `auth.config.ts` + `auth.ts`. Protected routes under `/admin/*`
- **Storage** — Cloudflare R2 via `@aws-sdk/client-s3`. Config in `lib/r2-config.ts`. `StorageFile` model tracks uploads, `Media` model abstracts references
- **Collections** — Hierarchical: Collection → Series → Volume → VolumePage → PageImage/PageText

### Database

PostgreSQL + PostGIS + pgvector via Prisma ORM. Key enums: `ContentStatus` (draft/published/archived), `ContentLanguage` (PL/HE/EN/YD/RS/LIT/LAT/DE/NA), `LayerType`, `DataMaturity`. Many-to-many relations use explicit association tables (e.g., `MapLayerAssociation`). Schema at `prisma/schema.prisma`.

### Type Definitions

- `app/admin/types/` — admin/editor types (`content-system.types.ts`, `editor-data.ts`)
- `app/admin/schema/` — Zod validation schemas per content type
- `types/` — API response types, collection types, map config types
