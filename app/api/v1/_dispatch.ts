/**
 * v1 API dispatch table
 *
 * Maps a public content-type slug (used in URLs) to a list/get function.
 * Each entry delegates to the existing admin action helpers so the v1
 * endpoints return the same rich, hydrated payloads the legacy routes
 * always returned (with relations, i18n fields, counts, etc.).
 *
 * If a content type is registered in `app/admin/system/content-types`
 * but not present here, the v1 catch-all falls back to a generic
 * `prisma.<model>.findMany` lookup that only returns top-level fields.
 */

import { listMapsAPI, getMapBySlug } from "@/app/admin/actions/maps";
import { listLayersAPI, getLayerBySlug } from "@/app/admin/actions/layers";
import {
  listDatasetsAPI,
  getDatasetBySlug,
} from "@/app/admin/actions/datasets";
import { listPostsAPI, getPostBySlug } from "@/app/admin/actions/posts";
import { listPagesAPI, getPageBySlug } from "@/app/admin/actions/pages";
import {
  listCategoriesAPI,
  getCategoryBySlug,
} from "@/app/admin/actions/categories";
import { listTagsAPI, getTagBySlug } from "@/app/admin/actions/tags";

export type ListResult = {
  // Always an array of records the public site can render directly.
  items: unknown[];
  // Optional pagination block when the underlying helper returns one.
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ListHandler = (
  searchParams: URLSearchParams
) => Promise<ListResult>;

export type GetHandler = (
  slug: string,
  searchParams: URLSearchParams
) => Promise<unknown | null>;

const parseIntSafe = (val: string | null) => {
  if (!val) return undefined;
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? undefined : n;
};

// ============================================================================
// LIST handlers
// ============================================================================

const listMaps: ListHandler = async (sp) => {
  const result = await listMapsAPI({
    status: sp.get("status") || undefined,
    categoryId: sp.get("categoryId") || undefined,
    categorySlug: sp.get("category") || undefined,
    regionId: sp.get("regionId") || undefined,
    regionSlug: sp.get("region") || undefined,
    tagId: sp.get("tagId") || undefined,
    tagSlug: sp.get("tag") || undefined,
    year: parseIntSafe(sp.get("year")),
    yearMin: parseIntSafe(sp.get("yearMin")),
    yearMax: parseIntSafe(sp.get("yearMax")),
    period: sp.get("period") || undefined,
    search: sp.get("search") || undefined,
    page: parseIntSafe(sp.get("page")),
    limit: parseIntSafe(sp.get("limit")),
    sort:
      (sp.get("sort") as "createdAt" | "updatedAt" | "title" | "year") ||
      undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
    lang: sp.get("lang") || undefined,
  });
  return { items: result.maps, pagination: result.pagination };
};

const listLayers: ListHandler = async (sp) => {
  const result = await listLayersAPI({
    status: sp.get("status") || undefined,
    categoryId: sp.get("categoryId") || undefined,
    categorySlug: sp.get("category") || undefined,
    tagId: sp.get("tagId") || undefined,
    tagSlug: sp.get("tag") || undefined,
    regionId: sp.get("regionId") || undefined,
    regionSlug: sp.get("region") || undefined,
    type: sp.get("type") || undefined,
    year: parseIntSafe(sp.get("year")),
    yearMin: parseIntSafe(sp.get("yearMin")),
    yearMax: parseIntSafe(sp.get("yearMax")),
    maturity: sp.get("maturity") || undefined,
    search: sp.get("search") || undefined,
    page: parseIntSafe(sp.get("page")),
    limit: parseIntSafe(sp.get("limit")),
    sort:
      (sp.get("sort") as "createdAt" | "updatedAt" | "name" | "minYear") ||
      undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
    lang: sp.get("lang") || undefined,
  });
  return { items: result.layers, pagination: result.pagination };
};

const listDatasets: ListHandler = async (sp) => {
  const result = await listDatasetsAPI({
    status: sp.get("status") || undefined,
    categoryId: sp.get("categoryId") || undefined,
    categorySlug: sp.get("category") || undefined,
    regionId: sp.get("regionId") || undefined,
    regionSlug: sp.get("region") || undefined,
    maturity: sp.get("maturity") || undefined,
    yearMin: parseIntSafe(sp.get("yearMin")),
    yearMax: parseIntSafe(sp.get("yearMax")),
    search: sp.get("search") || undefined,
    page: parseIntSafe(sp.get("page")),
    limit: parseIntSafe(sp.get("limit")),
    sort:
      (sp.get("sort") as "createdAt" | "updatedAt" | "title") || undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
    lang: sp.get("lang") || undefined,
  });
  return { items: result.datasets, pagination: result.pagination };
};

const listPosts: ListHandler = async (sp) => {
  const result = await listPostsAPI({
    status: sp.get("status") || undefined,
    categoryId: sp.get("categoryId") || undefined,
    categorySlug: sp.get("category") || undefined,
    tagId: sp.get("tagId") || undefined,
    tagSlug: sp.get("tag") || undefined,
    regionId: sp.get("regionId") || undefined,
    regionSlug: sp.get("region") || undefined,
    authorId: sp.get("authorId") || undefined,
    language: sp.get("language") || undefined,
    translationGroup: sp.get("translationGroup") || undefined,
    search: sp.get("search") || undefined,
    page: parseIntSafe(sp.get("page")),
    limit: parseIntSafe(sp.get("limit")),
    sort:
      (sp.get("sort") as "createdAt" | "updatedAt" | "title") || undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
  });
  return { items: result.posts, pagination: result.pagination };
};

const listPages: ListHandler = async (sp) => {
  const result = await listPagesAPI({
    status: sp.get("status") || undefined,
    tagId: sp.get("tagId") || undefined,
    tagSlug: sp.get("tag") || undefined,
    regionId: sp.get("regionId") || undefined,
    regionSlug: sp.get("region") || undefined,
    authorId: sp.get("authorId") || undefined,
    language: sp.get("language") || undefined,
    template: sp.get("template") || undefined,
    showInMenu: sp.has("showInMenu")
      ? sp.get("showInMenu") === "true"
      : undefined,
    parentId: sp.has("parentId") ? sp.get("parentId") || null : undefined,
    search: sp.get("search") || undefined,
    page: parseIntSafe(sp.get("page")),
    limit: parseIntSafe(sp.get("limit")),
    sort:
      (sp.get("sort") as
        | "createdAt"
        | "updatedAt"
        | "title"
        | "menuOrder") || undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
  });
  return { items: result.pages, pagination: result.pagination };
};

const listCategories: ListHandler = async (sp) => {
  const result = await listCategoriesAPI({
    search: sp.get("search") || undefined,
    sort:
      (sp.get("sort") as "title" | "createdAt" | "usageCount") || undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
    lang: sp.get("lang") || undefined,
  });
  return { items: result.categories };
};

const listTags: ListHandler = async (sp) => {
  const result = await listTagsAPI({
    search: sp.get("search") || undefined,
    sort:
      (sp.get("sort") as "name" | "createdAt" | "usageCount") || undefined,
    order: (sp.get("order") as "asc" | "desc") || undefined,
    limit: parseIntSafe(sp.get("limit")),
    lang: sp.get("lang") || undefined,
  });
  return { items: result.tags };
};

// ============================================================================
// GET-by-slug handlers
// ============================================================================

const getMap: GetHandler = async (slug, sp) => {
  return getMapBySlug(slug, {
    lang: sp.get("lang") || undefined,
    includeLayers: sp.get("includeLayers") !== "false",
    includeResources: sp.get("includeResources") === "true",
  });
};

const getLayer: GetHandler = async (slug, sp) => {
  return getLayerBySlug(slug, {
    lang: sp.get("lang") || undefined,
    includeMaps: sp.get("includeMaps") === "true",
  });
};

const getDataset: GetHandler = async (slug, sp) => {
  return getDatasetBySlug(slug, {
    lang: sp.get("lang") || undefined,
    includeResources: sp.get("includeResources") === "true",
  });
};

const getPost: GetHandler = async (slug) => {
  return getPostBySlug(slug);
};

const getPage: GetHandler = async (slug, sp) => {
  return getPageBySlug(slug, {
    includeChildren: sp.get("includeChildren") === "true",
  });
};

const getCategory: GetHandler = async (slug, sp) => {
  return getCategoryBySlug(slug, {
    lang: sp.get("lang") || undefined,
    includeContent: sp.get("includeContent") === "true",
    contentType:
      (sp.get("contentType") as "posts" | "series" | "datasets" | "maps") ||
      undefined,
  });
};

const getTag: GetHandler = async (slug, sp) => {
  return getTagBySlug(slug, {
    lang: sp.get("lang") || undefined,
    includeContent: sp.get("includeContent") === "true",
  });
};

// ============================================================================
// Dispatch tables (keyed by URL slug)
// ============================================================================

export const listHandlers: Record<string, ListHandler> = {
  maps: listMaps,
  layers: listLayers,
  datasets: listDatasets,
  posts: listPosts,
  pages: listPages,
  categories: listCategories,
  tags: listTags,
};

export const getHandlers: Record<string, GetHandler> = {
  maps: getMap,
  layers: getLayer,
  datasets: getDataset,
  posts: getPost,
  pages: getPage,
  categories: getCategory,
  tags: getTag,
};
