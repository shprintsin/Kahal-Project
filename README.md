# Kahal Project

A unified platform for data visualization and historical archive management.

## Features

- **Unified Canvas**: Advanced visualization for historical maps and diagrams.
- **Document Management**: Full-featured editor for historical documents with translation support.
- **Archive Explorer**: Hierarchical browsing of collections, series, and volumes.
- **Server Actions**: Modern Next.js data fetching architecture directly integrated with Prisma.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Prisma ORM, Server Actions
- **Database**: PostgreSQL
- **Development**: Bun / PNPM

## Getting Started

First, install dependencies:

```bash
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

This project has been refactored to use **Server Actions** for data fetching, resolving build-time API dependency issues and improving performance. All data interactions are handled through direct Prisma calls in server-side actions located in `app/actions` and `app/admin/actions`.
