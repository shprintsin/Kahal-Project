"use client";

import { useMapStudio, COLOR_PALETTES, type StudioLayer } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Circle, Hexagon, Paintbrush, Tag, Type, X } from "lucide-react";
import type { PolygonStyleConfig, PointStyleConfig, LabelConfig } from "@/types/map-config";

function isPolygonStyle(style: PolygonStyleConfig | PointStyleConfig): style is PolygonStyleConfig {
  return "default_color" in style;
}

function isPointStyle(style: PolygonStyleConfig | PointStyleConfig): style is PointStyleConfig {
  return "fillColor" in style;
}

function ColorSwatch({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-7 h-7 rounded-md border-2 transition-all hover:scale-110",
        selected ? "border-foreground ring-2 ring-primary/30" : "border-transparent"
      )}
      style={{ backgroundColor: color }}
    />
  );
}

function StyleSection({ layer }: { layer: StudioLayer }) {
  const { dispatch } = useMapStudio();
  const isPoint = layer.type === "POINTS";
  const style = layer.style;

  const handleColorChange = (color: string) => {
    if (isPointStyle(style)) {
      dispatch({
        type: "SET_LAYER_STYLE",
        layerId: layer.id,
        style: { ...style, fillColor: color },
      });
    } else if (isPolygonStyle(style)) {
      dispatch({
        type: "SET_LAYER_STYLE",
        layerId: layer.id,
        style: { ...style, default_color: color, color },
      });
    }
  };

  const handleStyleTypeChange = (type: string) => {
    dispatch({
      type: "SET_LAYER_STYLE",
      layerId: layer.id,
      style: { ...style, type: type as "simple" | "category" },
    });
  };

  const handleFieldChange = (field: string) => {
    dispatch({
      type: "SET_LAYER_STYLE",
      layerId: layer.id,
      style: { ...style, field },
    });
  };

  const applyPalette = (palette: string[]) => {
    if (!style.field || style.type !== "category") return;

    const uniqueValues = new Set<string>();
    layer.geoJsonData?.features.forEach((f) => {
      const val = (f.properties as Record<string, unknown>)?.[style.field!];
      if (val != null) uniqueValues.add(String(val));
    });

    const colorDict: Record<string, string> = {};
    const vals = Array.from(uniqueValues);
    vals.forEach((val, i) => {
      colorDict[val] = palette[i % palette.length];
    });

    dispatch({
      type: "SET_LAYER_STYLE",
      layerId: layer.id,
      style: { ...style, color_dict: colorDict },
    });
  };

  const currentColor = isPointStyle(style)
    ? style.fillColor
    : isPolygonStyle(style)
      ? style.default_color
      : "#3388ff";

  const strokeColor = style.color || (isPoint ? "#000" : "#3388ff");
  const strokeWeight = style.weight ?? (isPoint ? 0.5 : 2);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Style Type</Label>
        <Select value={style.type || "simple"} onValueChange={handleStyleTypeChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple" className="text-xs">Simple</SelectItem>
            <SelectItem value="category" className="text-xs">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {style.type === "category" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Category Field</Label>
          <Select value={style.field || ""} onValueChange={handleFieldChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select field..." />
            </SelectTrigger>
            <SelectContent>
              {layer.properties.map((prop) => (
                <SelectItem key={prop} value={prop} className="text-xs">
                  {prop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {style.type !== "category" && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentColor || "#3388ff"}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <Input
              value={currentColor || ""}
              onChange={(e) => handleColorChange(e.target.value)}
              className="h-8 text-xs font-mono flex-1"
              placeholder="#hex"
            />
          </div>
        </div>
      )}

      {style.type === "category" && style.field && (
        <div className="space-y-3">
          <Label className="text-xs font-medium">Color Palette</Label>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.name}
                onClick={() => applyPalette(palette.colors)}
                className="flex flex-col gap-1 p-2 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                <span className="text-[10px] font-medium text-muted-foreground">
                  {palette.name}
                </span>
                <div className="flex gap-0.5">
                  {palette.colors.slice(0, 6).map((c, i) => (
                    <div
                      key={i}
                      className="flex-1 h-3 rounded-sm first:rounded-l-md last:rounded-r-md"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>

          {style.color_dict && Object.keys(style.color_dict).length > 0 && (
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              <Label className="text-[10px] font-medium text-muted-foreground uppercase">
                Category Colors
              </Label>
              {Object.entries(style.color_dict).map(([val, color]) => (
                <div key={val} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => {
                      const newDict = { ...style.color_dict, [val]: e.target.value };
                      dispatch({
                        type: "SET_LAYER_STYLE",
                        layerId: layer.id,
                        style: { ...style, color_dict: newDict },
                      });
                    }}
                    className="w-5 h-5 rounded cursor-pointer border border-border"
                  />
                  <span className="text-[11px] truncate flex-1">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-medium">Opacity</Label>
        <Slider
          value={[layer.opacity]}
          min={0}
          max={1}
          step={0.05}
          onValueChange={([v]) =>
            dispatch({ type: "SET_LAYER_OPACITY", layerId: layer.id, opacity: v })
          }
        />
        <span className="text-[10px] text-muted-foreground">
          {Math.round(layer.opacity * 100)}%
        </span>
      </div>

      {isPointStyle(style) && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Point Radius</Label>
          <Slider
            value={[style.radius || 4]}
            min={1}
            max={20}
            step={0.5}
            onValueChange={([v]) =>
              dispatch({
                type: "SET_LAYER_STYLE",
                layerId: layer.id,
                style: { ...style, radius: v },
              })
            }
          />
          <span className="text-[10px] text-muted-foreground">
            {style.radius || 4}px
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-medium">Stroke Color</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) =>
              dispatch({
                type: "SET_LAYER_STYLE",
                layerId: layer.id,
                style: { ...style, color: e.target.value },
              })
            }
            className="w-8 h-8 rounded border border-border cursor-pointer"
          />
          <Input
            value={style.color || ""}
            onChange={(e) =>
              dispatch({
                type: "SET_LAYER_STYLE",
                layerId: layer.id,
                style: { ...style, color: e.target.value },
              })
            }
            className="h-8 text-xs font-mono flex-1"
            placeholder={isPoint ? "#000" : "#3388ff"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Stroke Width</Label>
        <Slider
          value={[strokeWeight]}
          min={0}
          max={isPoint ? 5 : 10}
          step={0.25}
          onValueChange={([v]) =>
            dispatch({
              type: "SET_LAYER_STYLE",
              layerId: layer.id,
              style: { ...style, weight: v },
            })
          }
        />
        <span className="text-[10px] text-muted-foreground">
          {strokeWeight}px
        </span>
      </div>

      {isPointStyle(style) && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Fill Opacity</Label>
          <Slider
            value={[style.fillOpacity ?? 0.8]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([v]) =>
              dispatch({
                type: "SET_LAYER_STYLE",
                layerId: layer.id,
                style: { ...style, fillOpacity: v },
              })
            }
          />
          <span className="text-[10px] text-muted-foreground">
            {Math.round((style.fillOpacity ?? 0.8) * 100)}%
          </span>
        </div>
      )}

      {isPolygonStyle(style) && (
        <div className="space-y-2">
          <Label className="text-xs font-medium">Fill Opacity</Label>
          <Slider
            value={[style.opacity ?? 0.2]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([v]) =>
              dispatch({
                type: "SET_LAYER_STYLE",
                layerId: layer.id,
                style: { ...style, opacity: v },
              })
            }
          />
          <span className="text-[10px] text-muted-foreground">
            {Math.round((style.opacity ?? 0.2) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

function LabelsSection({ layer }: { layer: StudioLayer }) {
  const { dispatch } = useMapStudio();
  const labels: LabelConfig = layer.labels || {
    show: false,
    field: "",
    className: "studio-label",
    position: "center",
  };

  const updateLabels = (updates: Partial<LabelConfig>) => {
    dispatch({
      type: "SET_LAYER_LABELS",
      layerId: layer.id,
      labels: { ...labels, ...updates },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Show Labels</Label>
        <Switch
          checked={labels.show}
          onCheckedChange={(show) => updateLabels({ show })}
        />
      </div>

      {labels.show && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Label Field</Label>
            <Select value={labels.field || ""} onValueChange={(field) => updateLabels({ field })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select field..." />
              </SelectTrigger>
              <SelectContent>
                {layer.properties.map((prop) => (
                  <SelectItem key={prop} value={prop} className="text-xs">{prop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Position</Label>
            <Select
              value={labels.position || "center"}
              onValueChange={(p) => updateLabels({ position: p as LabelConfig["position"] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center" className="text-xs">Center</SelectItem>
                <SelectItem value="top" className="text-xs">Top</SelectItem>
                <SelectItem value="bottom" className="text-xs">Bottom</SelectItem>
                <SelectItem value="left" className="text-xs">Left</SelectItem>
                <SelectItem value="right" className="text-xs">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Font Size</Label>
            <Slider
              value={[labels.fontSize || 10]}
              min={6}
              max={24}
              step={1}
              onValueChange={([v]) => updateLabels({ fontSize: v })}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function StylePanel() {
  const { state, dispatch } = useMapStudio();

  if (!state.rightPanelOpen) return null;

  const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId);

  if (!selectedLayer) {
    return (
      <div className="w-[320px] border-l border-border bg-card flex-shrink-0 flex items-center justify-center">
        <div className="text-center p-6">
          <Paintbrush className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Select a layer to edit its style
          </p>
        </div>
      </div>
    );
  }

  const Icon = selectedLayer.type === "POINTS" ? Circle : Hexagon;

  return (
    <div className="w-[320px] border-l border-border bg-card flex-shrink-0 flex flex-col">
      <div className="p-3 border-b border-border flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium truncate flex-1">
          {selectedLayer.name}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => dispatch({ type: "SELECT_LAYER", layerId: null })}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["style", "labels"]} className="px-3">
          <AccordionItem value="style">
            <AccordionTrigger className="text-xs font-semibold py-3">
              <div className="flex items-center gap-2">
                <Paintbrush className="w-3.5 h-3.5" />
                Style
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <StyleSection layer={selectedLayer} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="labels">
            <AccordionTrigger className="text-xs font-semibold py-3">
              <div className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5" />
                Labels
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <LabelsSection layer={selectedLayer} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="info">
            <AccordionTrigger className="text-xs font-semibold py-3">
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />
                Info
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{selectedLayer.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features</span>
                  <span>{selectedLayer.featureCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span>{selectedLayer.sourceType}</span>
                </div>
                {selectedLayer.properties.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Properties</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {selectedLayer.properties.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
