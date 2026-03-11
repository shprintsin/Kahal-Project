import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  getPosts,
  getPost,
  getPages,
  getPage,
  getCategories,
  getCategory,
  getPostsByCategory,
  getDatasets,
  getDataset,
  getMaps,
  getMap,
  getLayers,
  getLayer,
} from "../api"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

function mockOk(data: unknown) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(data),
  })
}

function mockError(status: number) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    statusText: "Error",
    text: () => Promise.resolve("Error body"),
  })
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe("getPosts", () => {
  it("returns posts wrapped in docs", async () => {
    const posts = [{ id: "1", title: "Test" }]
    mockOk(posts)
    const result = await getPosts()
    expect(result.docs).toEqual(posts)
  })

  it("returns empty docs when response is not array", async () => {
    mockOk({ data: [] })
    const result = await getPosts()
    expect(result.docs).toEqual([])
  })
})

describe("getPost", () => {
  it("returns post by slug", async () => {
    const post = { id: "1", slug: "test", title: "Test" }
    mockOk(post)
    const result = await getPost("test")
    expect(result).toEqual(post)
  })

  it("returns null on error", async () => {
    mockError(404)
    const result = await getPost("missing")
    expect(result).toBeNull()
  })
})

describe("getPages", () => {
  it("returns pages wrapped in docs", async () => {
    const pages = [{ id: "1", title: "About" }]
    mockOk(pages)
    const result = await getPages()
    expect(result.docs).toEqual(pages)
  })
})

describe("getPage", () => {
  it("returns null on error", async () => {
    mockError(404)
    const result = await getPage("missing")
    expect(result).toBeNull()
  })
})

describe("getCategories", () => {
  it("returns categories wrapped in docs", async () => {
    const cats = [{ id: "1", title: "History" }]
    mockOk(cats)
    const result = await getCategories()
    expect(result.docs).toEqual(cats)
  })
})

describe("getCategory", () => {
  it("returns null on error", async () => {
    mockError(404)
    const result = await getCategory("missing")
    expect(result).toBeNull()
  })
})

describe("getPostsByCategory", () => {
  it("returns posts for category", async () => {
    const posts = [{ id: "1" }]
    mockOk(posts)
    const result = await getPostsByCategory("history")
    expect(result.docs).toEqual(posts)
  })
})

describe("getDatasets", () => {
  it("returns datasets wrapped in docs", async () => {
    const ds = [{ id: "1" }]
    mockOk(ds)
    const result = await getDatasets()
    expect(result.docs).toEqual(ds)
  })
})

describe("getDataset", () => {
  it("returns null on error", async () => {
    mockError(404)
    const result = await getDataset("missing")
    expect(result).toBeNull()
  })
})

describe("getMaps", () => {
  it("returns maps wrapped in docs", async () => {
    const maps = [{ id: "1" }]
    mockOk(maps)
    const result = await getMaps()
    expect(result.docs).toEqual(maps)
  })
})

describe("getMap", () => {
  it("returns null on error", async () => {
    mockError(404)
    const result = await getMap("missing")
    expect(result).toBeNull()
  })
})

describe("getLayers", () => {
  it("returns layers wrapped in docs", async () => {
    const layers = [{ id: "1" }]
    mockOk(layers)
    const result = await getLayers()
    expect(result.docs).toEqual(layers)
  })
})

describe("getLayer", () => {
  it("returns null on error", async () => {
    mockError(404)
    const result = await getLayer("missing")
    expect(result).toBeNull()
  })
})
