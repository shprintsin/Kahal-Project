import { describe, it, expect } from "vitest"
import { generateSlugFromTitle } from "../slug-generator"

describe("generateSlugFromTitle", () => {
  it("converts English title to slug", () => {
    expect(generateSlugFromTitle("Hello World")).toBe("hello-world")
  })

  it("returns null for Hebrew text", () => {
    expect(generateSlugFromTitle("שלום עולם")).toBeNull()
  })

  it("returns null for mixed Hebrew and English", () => {
    expect(generateSlugFromTitle("Hello שלום")).toBeNull()
  })

  it("removes special characters", () => {
    expect(generateSlugFromTitle("Hello, World! (2024)")).toBe("hello-world-2024")
  })

  it("collapses multiple dashes", () => {
    expect(generateSlugFromTitle("Hello   World---Test")).toBe("hello-world-test")
  })

  it("trims leading and trailing dashes", () => {
    expect(generateSlugFromTitle("--Hello World--")).toBe("hello-world")
  })

  it("handles empty string", () => {
    expect(generateSlugFromTitle("")).toBe("")
  })

  it("converts underscores to dashes", () => {
    expect(generateSlugFromTitle("hello_world_test")).toBe("hello-world-test")
  })
})
