import { describe, it, expect } from "vitest"
import { getOptimizedImageUrl, ImagePresets } from "../image-utils"

describe("getOptimizedImageUrl", () => {
  it("returns empty string for empty url", () => {
    expect(getOptimizedImageUrl("")).toBe("")
  })

  it("generates Next.js image URL with defaults", () => {
    const url = getOptimizedImageUrl("https://example.com/img.jpg")
    expect(url).toContain("/_next/image?")
    expect(url).toContain("url=https%3A%2F%2Fexample.com%2Fimg.jpg")
    expect(url).toContain("w=200")
    expect(url).toContain("q=75")
  })

  it("respects custom width and quality", () => {
    const url = getOptimizedImageUrl("https://example.com/img.jpg", { width: 800, quality: 90 })
    expect(url).toContain("w=800")
    expect(url).toContain("q=90")
  })
})

describe("ImagePresets", () => {
  it("has correct thumbnail preset", () => {
    expect(ImagePresets.thumbnail).toEqual({ width: 200, quality: 75 })
  })

  it("has correct preview preset", () => {
    expect(ImagePresets.preview).toEqual({ width: 600, quality: 85 })
  })

  it("has correct fullscreen preset", () => {
    expect(ImagePresets.fullscreen).toEqual({ width: 1200, quality: 90 })
  })
})
