import { describe, it, expect } from "vitest"
import { stringToColor, getStyle } from "../mapUtils"

describe("stringToColor", () => {
  it("returns a hex color string", () => {
    const color = stringToColor("test")
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("returns consistent color for same input", () => {
    expect(stringToColor("abc")).toBe(stringToColor("abc"))
  })

  it("returns different colors for different inputs", () => {
    expect(stringToColor("abc")).not.toBe(stringToColor("xyz"))
  })

  it("handles empty string", () => {
    const color = stringToColor("")
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe("getStyle", () => {
  it("returns polygon style with default color", () => {
    const feature = { properties: {} }
    const layerConfig = {
      type: "polygon" as const,
      style: { default_color: "#ff0000", color: "white", weight: 2, opacity: 0.5 },
      name: "test",
      visible: true,
      sourceType: "url" as const,
    }
    const style = getStyle(feature, layerConfig as any)
    expect(style).toEqual({
      fillColor: "#ff0000",
      color: "white",
      weight: 2,
      fillOpacity: 0.5,
    })
  })

  it("uses category color from color_dict", () => {
    const feature = { properties: { region: "north" } }
    const layerConfig = {
      type: "polygon" as const,
      style: {
        type: "category",
        field: "region",
        default_color: "#ff0000",
        color_dict: { north: "#00ff00" },
      },
      name: "test",
      visible: true,
      sourceType: "url" as const,
    }
    const style = getStyle(feature, layerConfig as any)
    expect(style.fillColor).toBe("#00ff00")
  })

  it("falls back to stringToColor when category not in dict", () => {
    const feature = { properties: { region: "south" } }
    const layerConfig = {
      type: "polygon" as const,
      style: {
        type: "category",
        field: "region",
        default_color: "#ff0000",
        color_dict: { north: "#00ff00" },
      },
      name: "test",
      visible: true,
      sourceType: "url" as const,
    }
    const style = getStyle(feature, layerConfig as any)
    expect(style.fillColor).toMatch(/^#[0-9a-f]{6}$/)
    expect(style.fillColor).not.toBe("#ff0000")
  })

  it("returns point style with defaults", () => {
    const feature = { properties: {} }
    const layerConfig = {
      type: "point" as const,
      style: { fillColor: "#ff7800", radius: 4, color: "#000", weight: 0.5, fillOpacity: 0.8 },
      name: "test",
      visible: true,
      sourceType: "url" as const,
    }
    const style = getStyle(feature, layerConfig as any)
    expect(style.fillColor).toBe("#ff7800")
    expect(style.radius).toBe(4)
  })

  it("returns point style with graduated coloring", () => {
    const feature = { properties: { population: 500 } }
    const layerConfig = {
      type: "point" as const,
      style: {
        type: "graduated",
        fillColor: "#ff7800",
        radius: 4,
        color: "#000",
        weight: 0.5,
        fillOpacity: 0.8,
        graduated: {
          field: "population",
          method: "equal_interval",
          classes: 3,
          colorRamp: { start: "#ffffcc", end: "#800026" },
          breaks: [200, 600],
        },
      },
      name: "test",
      visible: true,
      sourceType: "url" as const,
    }
    const style = getStyle(feature, layerConfig as any)
    expect(style.fillColor).toMatch(/^#[0-9a-f]{6}$/)
    expect(style.fillColor).not.toBe("#ff7800")
  })
})
