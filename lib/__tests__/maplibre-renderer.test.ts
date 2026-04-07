import { describe, it, expect } from "vitest";
import {
  compileStrokeLineColor,
  compileStrokeLineWidth,
  compileSymbolLayer,
} from "../maplibre-renderer";
import type {
  PolygonStyleConfig,
  LabelConfig,
} from "@/types/map-config";

const catStyle = (overrides: Partial<PolygonStyleConfig> = {}): PolygonStyleConfig => ({
  type: "category",
  field: "viv",
  color_dict: { Rus: "#aaa", Podolia: "#bbb" },
  default_color: "#ccc",
  opacity: 0.2,
  weight: 1,
  color: "#999",
  ...overrides,
});

describe("compileStrokeLineColor", () => {
  it("returns a match expression when stroke_color_dict is present on category style", () => {
    const style = catStyle({
      stroke_color_dict: { Rus: "#8FA07A", Podolia: "#B0A07A" },
    });
    const expr = compileStrokeLineColor(style);
    expect(Array.isArray(expr)).toBe(true);
    expect((expr as unknown[])[0]).toBe("match");
    expect((expr as unknown[])[1]).toEqual(["get", "viv"]);
    // Match pairs follow: Rus, color, Podolia, color, fallback
    expect(expr).toContain("#8FA07A");
    expect(expr).toContain("#B0A07A");
    // Fallback is style.color
    expect((expr as unknown[])[(expr as unknown[]).length - 1]).toBe("#999");
  });

  it("falls back to style.color when stroke_color_dict is missing", () => {
    const style = catStyle();
    expect(compileStrokeLineColor(style)).toBe("#999");
  });

  it("ignores stroke_color_dict on non-category style", () => {
    const style = catStyle({
      type: "simple",
      stroke_color_dict: { Rus: "#111" },
    });
    expect(compileStrokeLineColor(style)).toBe("#999");
  });
});

describe("compileStrokeLineWidth", () => {
  it("returns a match expression when stroke_weight_dict is present", () => {
    const style = catStyle({
      stroke_weight_dict: { Rus: 2.5, Podolia: 0.5 },
    });
    const expr = compileStrokeLineWidth(style);
    expect(Array.isArray(expr)).toBe(true);
    expect((expr as unknown[])[0]).toBe("match");
    expect(expr).toContain(2.5);
    expect(expr).toContain(0.5);
  });

  it("falls back to style.weight when stroke_weight_dict is missing", () => {
    expect(compileStrokeLineWidth(catStyle())).toBe(1);
  });
});

describe("compileSymbolLayer labels.filter", () => {
  const makeLabels = (overrides: Partial<LabelConfig> = {}): LabelConfig => ({
    show: true,
    field: "name",
    className: "layer-label",
    position: "top",
    ...overrides,
  });

  it("omits filter when no include/exclude/filter are set", () => {
    const layer = compileSymbolLayer(makeLabels(), "pts");
    expect(layer.filter).toBeUndefined();
  });

  it("emits a single == expression for labels.filter alone", () => {
    const layer = compileSymbolLayer(
      makeLabels({ filter: { field: "is_center", value: true } }),
      "pts",
    );
    expect(layer.filter).toEqual([
      "==",
      ["get", "is_center"],
      true,
    ]);
  });

  it("combines include_list with labels.filter via 'all'", () => {
    const layer = compileSymbolLayer(
      makeLabels({
        include_list: ["Warsaw", "Krakow"],
        filter: { field: "is_center", value: true },
      }),
      "pts",
    );
    const filter = layer.filter as unknown[];
    expect(filter[0]).toBe("all");
    expect(filter).toHaveLength(3);
    // Second element is the include_list clause
    expect(filter[1]).toEqual([
      "in",
      ["get", "name"],
      ["literal", ["Warsaw", "Krakow"]],
    ]);
    // Third element is the feature-field filter
    expect(filter[2]).toEqual([
      "==",
      ["get", "is_center"],
      true,
    ]);
  });

  it("preserves existing single-clause behaviour when only exclude_list is set", () => {
    const layer = compileSymbolLayer(
      makeLabels({ exclude_list: ["skip"] }),
      "pts",
    );
    expect(layer.filter).toEqual([
      "!",
      ["in", ["get", "name"], ["literal", ["skip"]]],
    ]);
  });
});
