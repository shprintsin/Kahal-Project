import { NextResponse } from "next/server";

const SCHEMA = {
  name: "Kahal CMS API",
  version: "1.0",
  endpoint: "/api/cms",
  method: "POST",
  auth: {
    description: "Send x-api-key header or have an active session cookie",
    header: "x-api-key",
  },
  requestFormat: {
    action: "string (required) - action name from the list below",
    data: "object (optional) - action-specific payload",
  },
  actions: {
    "posts.list": {
      description: "List posts with filtering and pagination",
      data: {
        status: "string? - 'published' | 'draft'",
        categoryId: "string?",
        categorySlug: "string?",
        tagId: "string?",
        tagSlug: "string?",
        search: "string?",
        page: "number? (default 1)",
        limit: "number? (default 20, max 100)",
        sort: "string? - 'createdAt' | 'updatedAt' | 'title'",
        order: "string? - 'asc' | 'desc'",
      },
      returns: "{ posts: Post[], pagination: { page, limit, total, totalPages } }",
    },
    "posts.get": {
      description: "Get a single post by slug",
      data: { slug: "string (required)" },
      returns: "Post with content, author, tags, categories, regions",
    },
    "posts.create": {
      description: "Create a new post",
      data: {
        title: "string (required)",
        slug: "string (required)",
        content: "string? - Lexical JSON",
        excerpt: "string? - short summary",
        language: "string? - 'he' | 'en' | 'yi' | 'ru' | 'pl'",
        status: "string? - 'draft' | 'published'",
        category_id: "string?",
        author_id: "string?",
        thumbnail_id: "string?",
        tagIds: "string[]?",
        titleI18n: "object? - { en?: string, he?: string, ... }",
        contentI18n: "object? - { en?: string, he?: string, ... }",
        excerptI18n: "object? - { en?: string, he?: string, ... }",
      },
      returns: "Created post object",
    },
    "posts.update": {
      description: "Update an existing post. Only send fields you want to change.",
      data: {
        id: "string (required)",
        title: "string?",
        slug: "string?",
        content: "string?",
        excerpt: "string?",
        language: "string?",
        status: "string?",
        category_id: "string?",
        tagIds: "string[]?",
        titleI18n: "object?",
        contentI18n: "object?",
        excerptI18n: "object?",
      },
      returns: "Updated post object",
    },
    "posts.delete": {
      description: "Delete a post",
      data: { id: "string (required)" },
    },

    "categories.list": {
      description: "List all categories with usage counts",
      data: {
        search: "string?",
        sort: "string? - 'title' | 'createdAt' | 'usageCount'",
        order: "string? - 'asc' | 'desc'",
      },
      returns: "{ categories: Category[], total: number }",
    },
    "categories.get": {
      description: "Get category by slug",
      data: {
        slug: "string (required)",
        includeContent: "boolean?",
        contentType: "string? - 'posts' | 'series' | 'datasets' | 'maps'",
      },
    },
    "categories.create": {
      description: "Create a category",
      data: {
        title: "string (required)",
        slug: "string (required)",
        titleI18n: "object? - { he?: string, en?: string, ... }",
      },
    },
    "categories.update": {
      description: "Update a category",
      data: { id: "string (required)", title: "string?", slug: "string?", titleI18n: "object?" },
    },
    "categories.delete": {
      description: "Delete a category",
      data: { id: "string (required)" },
    },

    "tags.list": {
      description: "List all tags with usage counts",
      data: { search: "string?", sort: "string?", order: "string?", limit: "number?" },
    },
    "tags.get": {
      description: "Get tag by slug",
      data: { slug: "string (required)", includeContent: "boolean?" },
    },
    "tags.create": {
      description: "Create a tag",
      data: { slug: "string (required)", nameI18n: "object - { he?: string, en?: string }" },
    },
    "tags.update": {
      description: "Update a tag",
      data: { id: "string (required)", slug: "string?", nameI18n: "object?" },
    },
    "tags.delete": {
      description: "Delete a tag",
      data: { id: "string (required)" },
    },

    "menus.get": {
      description: "Get menu items for a location",
      data: {
        location: "string (required) - 'HEADER' | 'HERO_GRID' | 'HERO_ACTIONS' | 'HERO_STRIP' | 'FOOTER'",
      },
    },
    "menus.upsert": {
      description: "Replace all items in a menu location",
      data: {
        location: "string (required)",
        items: "MenuItem[] (required) - array of { label: { default: string, translations?: {} }, icon?: string, url?: string, order: number, children?: MenuItem[] }",
      },
    },
    "menus.getAllSettings": {
      description: "Get all site settings (menus + footer + copyright)",
      data: "none",
    },

    "settings.update": {
      description: "Update site-wide settings",
      data: {
        copyrightText: "{ default: string, translations?: { he?: string, en?: string } }",
      },
    },

    "footer.list": {
      description: "Get all footer columns",
      data: "none",
    },
    "footer.create": {
      description: "Create a footer column",
      data: {
        type: "string (required) - 'LINK_LIST' | 'RICH_TEXT'",
        order: "number (required)",
        title: "{ default: string, translations?: {} }",
        items: "FooterColumnItem[]? - for LINK_LIST type: { label: { default: string }, url?: string, icon?: string, order: number }",
        content: "{ default: string }? - for RICH_TEXT type",
      },
    },
    "footer.update": {
      description: "Update a footer column",
      data: { id: "string (required)", "...": "same as footer.create" },
    },
    "footer.delete": {
      description: "Delete a footer column",
      data: { id: "string (required)" },
    },

    "maps.list": {
      description: "List maps with filtering",
      data: { status: "string?", search: "string?", page: "number?", limit: "number?", categorySlug: "string?", regionSlug: "string?", tagSlug: "string?" },
    },
    "maps.get": {
      description: "Get a single map by slug with layers",
      data: { slug: "string (required)", lang: "string?", includeLayers: "boolean? (default true)" },
      returns: "Map with layers, tags, regions, config",
    },
    "maps.create": {
      description: "Create a map",
      data: {
        title: "string (required)",
        slug: "string (required)",
        description: "string?",
        status: "string?",
        year: "number?",
        period: "string?",
        categoryId: "string?",
        baseLayer: "string?",
        center: "object? - { lat: number, lng: number }",
        zoom: "number?",
      },
    },
    "maps.update": {
      description: "Update a map",
      data: { id: "string (required)", "...": "same as maps.create" },
    },
    "maps.delete": {
      description: "Delete a map",
      data: { id: "string (required)" },
    },

    "layers.list": {
      description: "List layers with filtering",
      data: { status: "string?", type: "string?", search: "string?", page: "number?", limit: "number?", categorySlug: "string?", regionSlug: "string?", tagSlug: "string?" },
      returns: "{ layers: Layer[], pagination: { page, limit, total, totalPages } }",
    },
    "layers.get": {
      description: "Get a single layer by slug",
      data: { slug: "string (required)", lang: "string?", includeMaps: "boolean?" },
      returns: "Layer with GeoJSON data, tags, regions",
    },
    "layers.create": {
      description: "Create a GeoJSON layer",
      data: {
        slug: "string (required)",
        name: "string (required)",
        type: "string (required) - 'POINTS' | 'POLYGONS' | 'POLYLINES' | 'MULTI_POLYGONS' | 'RASTER'",
        status: "string? - 'draft' | 'published'",
        description: "string?",
        sourceType: "string? - 'url' | 'database' | 'inline'",
        sourceUrl: "string?",
        geoJsonData: "object? - GeoJSON FeatureCollection",
        styleConfig: "object?",
        categoryId: "string?",
        tagIds: "string[]?",
        regionIds: "string[]?",
      },
    },
    "layers.update": {
      description: "Update a layer",
      data: { id: "string (required)", "...": "same as layers.create" },
    },
    "layers.delete": {
      description: "Delete a layer",
      data: { id: "string (required)" },
    },

    "datasets.list": {
      description: "List research datasets",
      data: { status: "string?", search: "string?", page: "number?", limit: "number?", categorySlug: "string?", regionSlug: "string?", maturity: "string?" },
    },
    "datasets.get": {
      description: "Get a single dataset by slug",
      data: { slug: "string (required)", lang: "string?", includeResources: "boolean?" },
      returns: "Dataset with category, regions, resources",
    },
    "datasets.create": {
      description: "Create a research dataset",
      data: {
        title: "string (required)",
        slug: "string (required)",
        description: "string?",
        status: "string?",
        categoryId: "string?",
        license: "string?",
        maturity: "string?",
      },
    },
    "datasets.update": {
      description: "Update a dataset. Only send fields you want to change.",
      data: { id: "string (required)", "...": "same as datasets.create, all fields optional" },
    },
    "datasets.delete": {
      description: "Delete a dataset",
      data: { id: "string (required)" },
    },

    "pages.list": {
      description: "List CMS pages",
      data: { status: "string?", template: "string?", search: "string?", page: "number?", limit: "number?", tagSlug: "string?", regionSlug: "string?" },
    },
    "pages.get": {
      description: "Get a single page by slug",
      data: { slug: "string (required)", includeChildren: "boolean?" },
      returns: "Page with content, author, tags, regions, parent",
    },
    "pages.create": {
      description: "Create a CMS page",
      data: {
        title: "string (required)",
        slug: "string (required)",
        content: "string?",
        template: "string?",
        status: "string?",
        parentId: "string?",
        tagIds: "string[]?",
        regionIds: "string[]?",
      },
    },
    "pages.update": {
      description: "Update a page",
      data: { id: "string (required)", "...": "same as pages.create" },
    },
    "pages.delete": {
      description: "Delete a page",
      data: { id: "string (required)" },
    },

    "regions.list": {
      description: "List all regions",
      data: "none",
      returns: "Region[]",
    },
    "regions.create": {
      description: "Create a geographic region",
      data: { name: "string (required)", slug: "string (required)", nameI18n: "object?" },
    },
    "regions.update": {
      description: "Update a region",
      data: { id: "string (required)", name: "string?", slug: "string?", nameI18n: "object?" },
    },
    "regions.delete": {
      description: "Delete a region",
      data: { id: "string (required)" },
    },

    "periods.list": {
      description: "List all time periods",
      data: "none",
      returns: "Period[]",
    },
    "periods.create": {
      description: "Create a time period",
      data: { name: "string (required)", slug: "string (required)", startYear: "number? (or dateStart: ISO date string)", endYear: "number? (or dateEnd: ISO date string)" },
    },
    "periods.update": {
      description: "Update a period",
      data: { id: "string (required)", name: "string?", slug: "string?", startYear: "number?", endYear: "number?" },
    },
    "periods.delete": {
      description: "Delete a period",
      data: { id: "string (required)" },
    },
  },
};

export async function GET() {
  return NextResponse.json(SCHEMA, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
