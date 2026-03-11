import { describe, it, expect } from "vitest"
import { generateDocumentSlug, sortMarkdownFiles } from "../document"

describe("generateDocumentSlug", () => {
  it("converts to lowercase with hyphens", () => {
    expect(generateDocumentSlug("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(generateDocumentSlug("Test! Document @#$")).toBe("test-document")
  })

  it("replaces underscores with hyphens", () => {
    expect(generateDocumentSlug("test_document_name")).toBe("test-document-name")
  })

  it("trims whitespace", () => {
    expect(generateDocumentSlug("  hello  ")).toBe("hello")
  })

  it("removes leading/trailing hyphens", () => {
    expect(generateDocumentSlug("-hello-")).toBe("hello")
  })

  it("handles empty string", () => {
    expect(generateDocumentSlug("")).toBe("")
  })
})

describe("sortMarkdownFiles", () => {
  it("sorts by numeric prefix", () => {
    const files = [
      { name: "0003.md", content: "" },
      { name: "0001.md", content: "" },
      { name: "0002.md", content: "" },
    ] as any[]

    const sorted = sortMarkdownFiles(files)
    expect(sorted.map(f => f.name)).toEqual(["0001.md", "0002.md", "0003.md"])
  })

  it("handles files without numeric prefix", () => {
    const files = [
      { name: "intro.md", content: "" },
      { name: "0001.md", content: "" },
    ] as any[]

    const sorted = sortMarkdownFiles(files)
    expect(sorted[0].name).toBe("intro.md")
    expect(sorted[1].name).toBe("0001.md")
  })

  it("handles empty array", () => {
    expect(sortMarkdownFiles([])).toEqual([])
  })
})
