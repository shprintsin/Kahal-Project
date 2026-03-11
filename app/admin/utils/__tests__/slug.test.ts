import { describe, it, expect } from "vitest"
import { generateSlug, extractI18nName } from "../slug"

describe("generateSlug", () => {
  it("converts to lowercase with hyphens", () => {
    expect(generateSlug("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(generateSlug("Test! @#$ Slug")).toBe("test-slug")
  })

  it("removes leading/trailing hyphens", () => {
    expect(generateSlug("  -hello- ")).toBe("hello")
  })

  it("collapses multiple separators", () => {
    expect(generateSlug("a   b---c")).toBe("a-b-c")
  })

  it("strips Hebrew by default", () => {
    expect(generateSlug("test שלום world")).toBe("test-world")
  })

  it("keeps Hebrew when includeUnicode is true", () => {
    const result = generateSlug("test שלום world", true)
    expect(result).toContain("שלום")
  })

  it("keeps Cyrillic when includeUnicode is true", () => {
    const result = generateSlug("привет world", true)
    expect(result).toContain("привет")
  })
})

describe("extractI18nName", () => {
  it("returns English name first", () => {
    expect(extractI18nName({ en: "English", he: "Hebrew" })).toBe("English")
  })

  it("falls back to Hebrew", () => {
    expect(extractI18nName({ he: "Hebrew" })).toBe("Hebrew")
  })

  it("falls back to Polish", () => {
    expect(extractI18nName({ pl: "Polish" })).toBe("Polish")
  })

  it("returns first value if no known key", () => {
    expect(extractI18nName({ fr: "French" })).toBe("French")
  })

  it("returns fallback for null", () => {
    expect(extractI18nName(null, "fallback")).toBe("fallback")
  })

  it("returns fallback for non-object", () => {
    expect(extractI18nName("string", "fallback")).toBe("fallback")
  })

  it("returns empty string by default", () => {
    expect(extractI18nName(null)).toBe("")
  })
})
