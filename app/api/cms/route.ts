import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

import type { ListPostsOptions } from "@/app/admin/actions/posts";
import type { ListCategoriesOptions, GetCategoryOptions } from "@/app/admin/actions/categories";
import type { ListTagsOptions, GetTagOptions } from "@/app/admin/actions/tags";
import type { MenuLocation, LocalizedText, MenuItem, FooterColumn } from "@/app/admin/types/menus";
import type { LayerFormData } from "@/app/admin/actions/layers";

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
} from "@/app/admin/actions/maps";

import {
  createLayer,
  updateLayer,
  deleteLayer,
} from "@/app/admin/actions/layers";

import {
  createDataset,
  updateDataset,
  deleteDataset,
  listDatasetsAPI,
} from "@/app/admin/actions/datasets";

import {
  createPage,
  updatePage,
  deletePage,
  listPagesAPI,
} from "@/app/admin/actions/pages";

import {
  createRegion,
  updateRegion,
  deleteRegion,
} from "@/app/admin/actions/regions";

import {
  createPeriod,
  updatePeriod,
  deletePeriod,
} from "@/app/admin/actions/periods";

interface ActionMap {
  "posts.list": { handler: (data: ListPostsOptions) => ReturnType<typeof listPostsAPI> };
  "posts.get": { handler: (data: { slug: string }) => ReturnType<typeof getPostBySlug> };
  "posts.create": { handler: (data: Parameters<typeof createPost>[0] & { tagIds?: string[] }) => ReturnType<typeof createPost> };
  "posts.update": { handler: (data: { id: string; tagIds?: string[] } & Parameters<typeof updatePost>[1]) => ReturnType<typeof updatePost> };
  "posts.delete": { handler: (data: { id: string }) => ReturnType<typeof deletePost> };

  "categories.list": { handler: (data: ListCategoriesOptions) => ReturnType<typeof listCategoriesAPI> };
  "categories.get": { handler: (data: { slug: string } & GetCategoryOptions) => ReturnType<typeof getCategoryBySlug> };
  "categories.create": { handler: (data: Parameters<typeof createCategory>[0]) => ReturnType<typeof createCategory> };
  "categories.update": { handler: (data: { id: string } & Parameters<typeof updateCategory>[1]) => ReturnType<typeof updateCategory> };
  "categories.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteCategory> };

  "tags.list": { handler: (data: ListTagsOptions) => ReturnType<typeof listTagsAPI> };
  "tags.get": { handler: (data: { slug: string } & GetTagOptions) => ReturnType<typeof getTagBySlug> };
  "tags.create": { handler: (data: Parameters<typeof createTag>[0]) => ReturnType<typeof createTag> };
  "tags.update": { handler: (data: { id: string } & Parameters<typeof updateTag>[1]) => ReturnType<typeof updateTag> };
  "tags.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteTag> };

  "menus.get": { handler: (data: { location: MenuLocation }) => ReturnType<typeof getMenuByLocation> };
  "menus.upsert": { handler: (data: { location: MenuLocation; items: MenuItem[] }) => ReturnType<typeof upsertMenu> };
  "menus.getAllSettings": { handler: (data: void) => ReturnType<typeof getAllSiteSettings> };

  "settings.update": { handler: (data: { copyrightText: LocalizedText }) => ReturnType<typeof updateSiteSettings> };

  "footer.list": { handler: (data: void) => ReturnType<typeof getFooterColumns> };
  "footer.create": { handler: (data: Omit<FooterColumn, "id">) => ReturnType<typeof createFooterColumn> };
  "footer.update": { handler: (data: { id: string } & FooterColumn) => ReturnType<typeof updateFooterColumn> };
  "footer.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteFooterColumn> };

  "maps.list": { handler: (data: Parameters<typeof listMapsAPI>[0]) => ReturnType<typeof listMapsAPI> };
  "maps.create": { handler: (data: Parameters<typeof createMap>[0]) => ReturnType<typeof createMap> };
  "maps.update": { handler: (data: { id: string } & Parameters<typeof updateMap>[1]) => ReturnType<typeof updateMap> };
  "maps.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteMap> };

  "layers.create": { handler: (data: LayerFormData) => ReturnType<typeof createLayer> };
  "layers.update": { handler: (data: { id: string } & Partial<LayerFormData>) => ReturnType<typeof updateLayer> };
  "layers.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteLayer> };

  "datasets.list": { handler: (data: Parameters<typeof listDatasetsAPI>[0]) => ReturnType<typeof listDatasetsAPI> };
  "datasets.create": { handler: (data: Parameters<typeof createDataset>[0]) => ReturnType<typeof createDataset> };
  "datasets.update": { handler: (data: { id: string } & Parameters<typeof updateDataset>[1]) => ReturnType<typeof updateDataset> };
  "datasets.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteDataset> };

  "pages.list": { handler: (data: Parameters<typeof listPagesAPI>[0]) => ReturnType<typeof listPagesAPI> };
  "pages.create": { handler: (data: Parameters<typeof createPage>[0] & { tagIds?: string[]; regionIds?: string[] }) => ReturnType<typeof createPage> };
  "pages.update": { handler: (data: { id: string; tagIds?: string[]; regionIds?: string[] } & Parameters<typeof updatePage>[1]) => ReturnType<typeof updatePage> };
  "pages.delete": { handler: (data: { id: string }) => ReturnType<typeof deletePage> };

  "regions.create": { handler: (data: Parameters<typeof createRegion>[0]) => ReturnType<typeof createRegion> };
  "regions.update": { handler: (data: { id: string } & Parameters<typeof updateRegion>[1]) => ReturnType<typeof updateRegion> };
  "regions.delete": { handler: (data: { id: string }) => ReturnType<typeof deleteRegion> };

  "periods.create": { handler: (data: Parameters<typeof createPeriod>[0]) => ReturnType<typeof createPeriod> };
  "periods.update": { handler: (data: { id: string } & Parameters<typeof updatePeriod>[1]) => ReturnType<typeof updatePeriod> };
  "periods.delete": { handler: (data: { id: string }) => ReturnType<typeof deletePeriod> };
}

type ActionName = keyof ActionMap;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ACTION_REGISTRY: Record<ActionName, (data: any) => Promise<any>> = {
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
  "maps.create": (data) => createMap(data),
  "maps.update": (data) => updateMap(data.id, data),
  "maps.delete": (data) => deleteMap(data.id),

  "layers.create": (data) => createLayer(data),
  "layers.update": (data) => updateLayer(data.id, data),
  "layers.delete": (data) => deleteLayer(data.id),

  "datasets.list": (data) => listDatasetsAPI(data || {}),
  "datasets.create": (data) => createDataset(data),
  "datasets.update": (data) => updateDataset(data.id, data),
  "datasets.delete": (data) => deleteDataset(data.id),

  "pages.list": (data) => listPagesAPI(data || {}),
  "pages.create": (data) => createPage(data, data.tagIds, data.regionIds),
  "pages.update": (data) => updatePage(data.id, data, data.tagIds, data.regionIds),
  "pages.delete": (data) => deletePage(data.id),

  "regions.create": (data) => createRegion(data),
  "regions.update": (data) => updateRegion(data.id, data),
  "regions.delete": (data) => deleteRegion(data.id),

  "periods.create": (data) => createPeriod(data),
  "periods.update": (data) => updatePeriod(data.id, data),
  "periods.delete": (data) => deletePeriod(data.id),
};

const ALL_ACTIONS = Object.keys(ACTION_REGISTRY) as ActionName[];

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const validKey = process.env.CMS_API_KEY;

  const apiKeyValid = validKey && apiKey === validKey;

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

  if (!ALL_ACTIONS.includes(action as ActionName)) {
    return errorResponse(
      `Unknown action '${action}'. Available: ${ALL_ACTIONS.join(", ")}`,
      400
    );
  }

  const handler = ACTION_REGISTRY[action as ActionName];

  try {
    const result = await handler(data || {});
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
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
