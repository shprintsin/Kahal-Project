import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/app/admin/actions/menus", () => ({
  getMenuByLocation: vi.fn(),
  getFooterColumns: vi.fn(),
  getSiteSettings: vi.fn(),
}))

vi.mock("@/app/Data", () => ({
  navigation: [{ label: "Fallback", href: "/", icon: null }],
}))

vi.mock("react", async () => {
  const actual = await vi.importActual("react")
  return {
    ...actual,
    cache: (fn: any) => fn,
  }
})

import { getNavigation, getSiteShellData } from "../get-navigation"
import { getMenuByLocation, getFooterColumns, getSiteSettings } from "@/app/admin/actions/menus"

const mockGetMenuByLocation = vi.mocked(getMenuByLocation)
const mockGetFooterColumns = vi.mocked(getFooterColumns)
const mockGetSiteSettings = vi.mocked(getSiteSettings)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getNavigation", () => {
  it("returns DB navigation when menu exists", async () => {
    mockGetMenuByLocation.mockResolvedValueOnce({
      location: "HEADER",
      items: [
        { label: { default: "Home" }, url: "/", icon: "Home", children: [] },
      ],
    } as any)

    const nav = await getNavigation()
    expect(nav).toEqual([
      { label: "Home", icon: "Home", href: "/", subItems: undefined },
    ])
  })

  it("returns fallback navigation on error", async () => {
    mockGetMenuByLocation.mockRejectedValueOnce(new Error("DB error"))

    const nav = await getNavigation()
    expect(nav).toEqual([{ label: "Fallback", href: "/", icon: null }])
  })

  it("returns fallback when menu has no items", async () => {
    mockGetMenuByLocation.mockResolvedValueOnce({
      location: "HEADER",
      items: [],
    } as any)

    const nav = await getNavigation()
    expect(nav).toEqual([{ label: "Fallback", href: "/", icon: null }])
  })
})

describe("getSiteShellData", () => {
  it("returns combined shell data", async () => {
    mockGetMenuByLocation.mockResolvedValueOnce({
      location: "HEADER",
      items: [{ label: { default: "Home" }, url: "/", icon: null, children: [] }],
    } as any)
    mockGetFooterColumns.mockResolvedValueOnce([
      { id: "1", title: { default: "Links" }, links: [] },
    ] as any)
    mockGetSiteSettings.mockResolvedValueOnce({
      copyrightText: { default: "© Test" },
    } as any)

    const data = await getSiteShellData()
    expect(data.navigation).toHaveLength(1)
    expect(data.footerColumns).toHaveLength(1)
    expect(data.copyrightText).toBe("© Test")
  })

  it("handles footer/settings errors gracefully", async () => {
    mockGetMenuByLocation.mockResolvedValueOnce({
      location: "HEADER",
      items: [{ label: { default: "Home" }, url: "/", icon: null, children: [] }],
    } as any)
    mockGetFooterColumns.mockRejectedValueOnce(new Error("fail"))
    mockGetSiteSettings.mockRejectedValueOnce(new Error("fail"))

    const data = await getSiteShellData()
    expect(data.navigation).toHaveLength(1)
    expect(data.footerColumns).toEqual([])
    expect(data.copyrightText).toContain("פרויקט הקהל")
  })
})
