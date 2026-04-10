import { describe, it, expect } from "vitest"
import {
  getI18nText,
  buildI18nColumns,
  flattenI18n,
  unflattenI18n,
  DEFAULT_LANGUAGES,
} from "../table-utils"

describe("getI18nText", () => {
  it("extracts text from i18n object by priority order", () => {
    expect(getI18nText({ en: "Hello", he: "שלום" })).toBe("Hello")
  })

  it("falls back to next language", () => {
    expect(getI18nText({ he: "שלום" })).toBe("שלום")
  })

  it("falls back to first available value", () => {
    expect(getI18nText({ fr: "Bonjour" })).toBe("Bonjour")
  })

  it("returns string value directly", () => {
    expect(getI18nText("Direct text")).toBe("Direct text")
  })

  it("returns fallback for empty object", () => {
    expect(getI18nText({})).toBe("Untitled")
  })

  it("returns fallback for null", () => {
    expect(getI18nText(null)).toBe("Untitled")
  })

  it("returns custom fallback", () => {
    expect(getI18nText(null, "No name")).toBe("No name")
  })

  it("respects custom order", () => {
    expect(getI18nText({ en: "English", he: "עברית" }, "Untitled", ["he", "en"])).toBe("עברית")
  })

  it("skips empty strings", () => {
    expect(getI18nText({ en: "", he: "שלום" })).toBe("שלום")
  })
})

describe("buildI18nColumns", () => {
  it("builds columns from language options", () => {
    const cols = buildI18nColumns(DEFAULT_LANGUAGES, "Name")
    expect(cols).toHaveLength(2)
    expect(cols[0]).toEqual({
      key: "he",
      label: "Name (HE)",
      width: "w-[20%]",
      placeholder: "Hebrew",
      dir: "rtl",
      align: "right",
    })
    expect(cols[1].dir).toBe("ltr")
    expect(cols[1].align).toBe("left")
  })

  it("uses custom width", () => {
    const cols = buildI18nColumns(DEFAULT_LANGUAGES, "Title", "w-[30%]")
    expect(cols[0].width).toBe("w-[30%]")
  })
})

describe("flattenI18n", () => {
  it("flattens i18n object to flat keys", () => {
    const item = { id: "1", nameI18n: { en: "Hello", he: "שלום" } }
    const result = flattenI18n(item, "nameI18n", DEFAULT_LANGUAGES)
    expect(result.en).toBe("Hello")
    expect(result.he).toBe("שלום")
    expect(result.id).toBe("1")
  })

  it("uses empty string for missing languages", () => {
    const item = { id: "1", nameI18n: { en: "Hello" } }
    const result = flattenI18n(item, "nameI18n", DEFAULT_LANGUAGES)
    expect(result.he).toBe("")
  })
})

describe("unflattenI18n", () => {
  it("reconstructs i18n object from flat keys", () => {
    const values = { en: "Hello", he: "שלום", id: "1" }
    const result = unflattenI18n(values, "nameI18n", DEFAULT_LANGUAGES)
    expect(result.nameI18n).toEqual({ he: "שלום", en: "Hello" })
    expect(result.id).toBe("1")
  })
})
