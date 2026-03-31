import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { auth } from "@/auth";

import type { ListPostsOptions } from "@/app/admin/actions/posts";
import type { ListCategoriesOptions, GetCategoryOptions } from "@/app/admin/actions/categories";
import type { ListTagsOptions, GetTagOptions } from "@/app/admin/actions/tags";
import type { MenuLocation, LocalizedText, MenuItem, FooterColumn } from "@/app/admin/types/menus";
import type { LayerFormData, ListLayersOptions, GetLayerOptions } from "@/app/admin/actions/layers";

import {
  createPost,
  updatePost,
  deletePost,
  listPostsAPI,
  getPostBySlug,
} from "@/app/admin/actions/posts";

import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategoriesAPI,
  getCategoryBySlug,
} from "@/app/admin/actions/categories";

import {
  createTag,
  updateTag,
  deleteTag,
  listTagsAPI,
  getTagBySlug,
} from "@/app/admin/actions/tags";

import {
  upsertMenu,
  getMenuByLocation,
  getAllSiteSettings,
  updateSiteSettings,
  createFooterColumn,
  updateFooterColumn,
  deleteFooterColumn,
  getFooterColumns,
} from "@/app/admin/actions/menus";

import {
  createMap,
  updateMap,
  deleteMap,
  listMapsAPI,
  getMapBySlug,
} from "@/app/admin/actions/maps";

import {
  createLayer,
  updateLayer,
  deleteLayer,
  listLayersAPI,
  getLayerBySlug,
} from "@/app/admin/actions/layers";

import {
  createDataset,
  updateDataset,
  deleteDataset,
  listDatasetsAPI,
  getDatasetBySlug,
} from "@/app/admin/actions/datasets";

import {
  createPage,
  updatePage,
  deletePage,
  listPagesAPI,
  getPageBySlug,
} from "@/app/admin/actions/pages";

import {
  createRegion,
  updateRegion,
  deleteRegion,
  getRegions,
} from "@/app/admin/actions/regions";

import {
  createPeriod,
  updatePeriod,
  deletePeriod,
  getPeriods,
} from "@/app/admin/actions/periods";

function normalizePeriodData(data: Record<string, unknown>) {
  const normalized = { ...data };
  if (normalized.startYear !== undefined && normalized.dateStart === undefined) {
    normalized.dateStart = String(normalized.startYear) + "-01-01";
    delete normalized.startYear;
  }
  if (normalized.endYear !== undefined && normalized.dateEnd === undefined) {
    normalized.dateEnd = String(normalized.endYear) + "-12-31";
    delete normalized.endYear;
  }
  return normalized;
}

const REQUIRED_FIELDS: Record<string, string[]> = {
  "posts.create": ["title", "slug"],
  "posts.get": ["slug"],
  "posts.update": ["id"],
  "posts.delete": ["id"],
  "categories.get": ["slug"],
  "categories.create": ["title", "slug"],
  "categories.update": ["id"],
  "categories.delete": ["id"],
  "tags.get": ["slug"],
  "tags.create": ["slug"],
  "tags.update": ["id"],
  "tags.delete": ["id"],
  "menus.get": ["location"],
  "menus.upsert": ["location", "items"],
  "settings.update": ["copyrightText"],
  "footer.update": ["id"],
  "footer.delete": ["id"],
  "maps.get": ["slug"],
  "maps.create": ["title", "slug"],
  "maps.update": ["id"],
  "maps.delete": ["id"],
  "layers.get": ["slug"],
  "layers.create": ["slug", "name", "type"],
  "layers.update": ["id"],
  "layers.delete": ["id"],
  "datasets.get": ["slug"],
  "datasets.create": ["slug"],
  "datasets.update": ["id"],
  "datasets.delete": ["id"],
  "pages.get": ["slug"],
  "pages.create": ["title", "slug"],
  "pages.update": ["id"],
  "pages.delete": ["id"],
  "regions.create": ["name", "slug"],
  "regions.update": ["id"],
  "regions.delete": ["id"],
  "periods.create": ["name", "slug"],
  "periods.update": ["id"],
  "periods.delete": ["id"],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ACTION_REGISTRY: Record<string, (data: any) => Promise<any>> = {
  "posts.list": (data) => listPostsAPI(data || {}),
  "posts.get": (data) => getPostBySlug(data.slug),
  "posts.create": (data) => createPost(data, data.tagIds),
  "posts.update": (data) => updatePost(data.id, data, data.tagIds),
  "posts.delete": (data) => deletePost(data.id),

  "categories.list": (data) => listCategoriesAPI(data || {}),
  "categories.get": (data) => getCategoryBySlug(data.slug, data),
  "categories.create": (data) => createCategory(data),
  "categories.update": (data) => updateCategory(data.id, data),
  "categories.delete": (data) => deleteCategory(data.id),

  "tags.list": (data) => listTagsAPI(data || {}),
  "tags.get": (data) => getTagBySlug(data.slug, data),
  "tags.create": (data) => createTag(data),
  "tags.update": (data) => updateTag(data.id, data),
  "tags.delete": (data) => deleteTag(data.id),

  "menus.get": (data) => getMenuByLocation(data.location),
  "menus.upsert": (data) => upsertMenu(data.location, data.items),
  "menus.getAllSettings": () => getAllSiteSettings(),

  "settings.update": (data) => updateSiteSettings(data.copyrightText),

  "footer.list": () => getFooterColumns(),
  "footer.create": (data) => createFooterColumn(data),
  "footer.update": (data) => updateFooterColumn(data.id, data),
  "footer.delete": (data) => deleteFooterColumn(data.id),

  "maps.list": (data) => listMapsAPI(data || {}),
  "maps.get": (data) => getMapBySlug(data.slug, data),
  "maps.create": (data) => createMap(data),
  "maps.update": (data) => updateMap(data.id, data),
  "maps.delete": (data) => deleteMap(data.id),

  "layers.list": (data) => listLayersAPI(data || {}),
  "layers.get": (data) => getLayerBySlug(data.slug, data),
  "layers.create": (data) => createLayer(data),
  "layers.update": (data) => updateLayer(data.id, data),
  "layers.delete": (data) => deleteLayer(data.id),

  "datasets.list": (data) => listDatasetsAPI(data || {}),
  "datasets.get": (data) => getDatasetBySlug(data.slug, data),
  "datasets.create": (data) => createDataset(data),
  "datasets.update": (data) => updateDataset(data.id, data),
  "datasets.delete": (data) => deleteDataset(data.id),

  "pages.list": (data) => listPagesAPI(data || {}),
  "pages.get": (data) => getPageBySlug(data.slug, data),
  "pages.create": (data) => createPage(data, data.tagIds, data.regionIds),
  "pages.update": (data) => updatePage(data.id, data, data.tagIds, data.regionIds),
  "pages.delete": (data) => deletePage(data.id),

  "regions.list": () => getRegions(),
  "regions.create": (data) => createRegion(data),
  "regions.update": (data) => updateRegion(data.id, data),
  "regions.delete": (data) => deleteRegion(data.id),

  "periods.list": () => getPeriods(),
  "periods.create": (data) => createPeriod(normalizePeriodData(data)),
  "periods.update": (data) => updatePeriod(data.id, normalizePeriodData(data)),
  "periods.delete": (data) => deletePeriod(data.id),
};

const ALL_ACTIONS = Object.keys(ACTION_REGISTRY);

function errorResponse(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function validateRequiredFields(action: string, data: Record<string, unknown>): string | null {
  const required = REQUIRED_FIELDS[action];
  if (!required) return null;

  const missing = required.filter((field) => data[field] === undefined || data[field] === null);
  if (missing.length > 0) {
    return `Missing required field(s): ${missing.join(", ")}`;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const validKey = process.env.CMS_API_KEY;

  const apiKeyValid = validKey && apiKey && (() => {
    const a = Buffer.from(apiKey, 'utf-8');
    const b = Buffer.from(validKey, 'utf-8');
    return a.length === b.length && timingSafeEqual(a, b);
  })();

  if (!apiKeyValid) {
    const session = await auth();
    if (!session?.user) {
      return errorResponse("Unauthorized: provide x-api-key header or valid session", 401);
    }
  }

  let body: { action: string; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const { action, data } = body;

  if (!action || typeof action !== "string") {
    return errorResponse("Missing or invalid 'action' field", 400);
  }

  if (!ALL_ACTIONS.includes(action)) {
    return errorResponse(
      `Unknown action '${action}'. Available: ${ALL_ACTIONS.join(", ")}`,
      400
    );
  }

  const payload = (data || {}) as Record<string, unknown>;

  const validationError = validateRequiredFields(action, payload);
  if (validationError) {
    return errorResponse(validationError, 400);
  }

  const handler = ACTION_REGISTRY[action];

  try {
    const result = await handler(payload);
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const raw = error instanceof Error ? error.message : "Internal server error";
    const message = raw.includes("invocation")
      ? raw.split("\n").find((line) => line.includes("Argument"))?.trim() || "Invalid input data"
      : raw;
    console.error(`CMS API error [${action}]:`, error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Kahal CMS API",
    version: "1.0",
    usage: "POST /api/cms with { action: string, data?: object }",
    schemaUrl: "/api/cms/schema",
    auth: "x-api-key header or session cookie",
    actions: ALL_ACTIONS,
  });
}
