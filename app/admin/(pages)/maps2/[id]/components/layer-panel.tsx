"use client";

import { useCallback, useState } from "react";
import { useDataStudio, type StudioLayer } from "../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { AddLayerDialog } from "./add-layer-dialog";
import { toast } from "sonner";
import type { FeatureCollection } from "geojson";

interface LayerPanelProps {
  layerLibrary: { id: string; name: string; slug: string; type: string; featureCount: number }[];
  onAddFromLibrary: (layerId: string) => void;
  onAddInline: (name: string, type: StudioLayer["type"], geoJson: FeatureCollection) => void;
}

function getLayerColor(style: StudioLayer["style"]): string {
  if ("fillColor" in style) return style.fillColor;
  if ("default_color" in style) return style.default_color;
  return (style as { color?: string }).color || "#3388ff";
}

function detectGeometryType(geoJson: FeatureCollection): StudioLayer["type"] {
  const first = geoJson.features?.[0];
  if (!first?.geometry) return "POLYGONS";
  const gType = first.geometry.type;
  if (gType === "Point" || gType === "MultiPoint") return "POINTS";
  if (gType === "LineString" || gType === "MultiLineString") return "POLYLINES";
  return "POLYGONS";
}

interface LayerRowProps {
  layer: StudioLayer;
  color: string;
  isSelected: boolean;
  isDragged: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
}

function LayerRow({ layer, color, isSelected, isDragged, onDragStart, onDragOver, onDragEnd, onSelect, onToggleVisibility, onRemove }: LayerRowProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(layer.id)}
      onDragOver={(e) => onDragOver(e, layer.id)}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-sm",
        isSelected
          ? "bg-primary/10 ring-1 ring-primary/30"
          : "hover:bg-muted/80",
        isDragged && "opacity-50"
      )}
    >
      <GripVertical className="w-3 h-3 text-muted-foreground/40 cursor-grab flex-shrink-0" />

      <div
        className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-foreground/10"
        style={{ backgroundColor: color }}
      />

      <span className="flex-1 truncate text-xs font-medium">
        {layer.name}
      </span>

      <span className="text-[10px] text-muted-foreground tabular-nums">
        {layer.featureCount}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="p-0.5 rounded hover:bg-muted"
      >
        {layer.visible ? (
          <Eye className="w-3 h-3 text-muted-foreground" />
        ) : (
          <EyeOff className="w-3 h-3 text-muted-foreground/40" />
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-0.5 rounded hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-3 h-3 text-destructive" />
      </button>
    </div>
  );
}

export function LayerPanel({ layerLibrary, onAddFromLibrary, onAddInline }: LayerPanelProps) {
  const { state, dispatch } = useDataStudio();
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.endsWith(".json") && !file.name.endsWith(".geojson")) {
      toast.error("Only .json and .geojson files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.type === "FeatureCollection" && Array.isArray(json.features)) {
          const name = file.name.replace(/\.geojson$|\.json$/i, "");
          const type = detectGeometryType(json);
          onAddInline(name, type, json);
          toast.success(`"${name}" added — ${json.features.length} features`);
        } else {
          toast.error("Invalid GeoJSON: expected FeatureCollection");
        }
      } catch {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  }, [onAddInline]);

  const handleDragOverFile = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeaveFile = useCallback((e: React.DragEvent) => {
    if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  if (!state.leftPanelOpen) return null;

  const sortedLayers = [...state.layers].sort((a, b) => b.zIndex - a.zIndex);
  const filtered = search
    ? sortedLayers.filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    : sortedLayers;

  const handleDragStart = (layerId: string) => {
    setDraggedId(layerId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const currentOrder = sortedLayers.map((l) => l.id);
    const dragIdx = currentOrder.indexOf(draggedId);
    const targetIdx = currentOrder.indexOf(targetId);

    if (dragIdx === -1 || targetIdx === -1) return;

    const newOrder = [...currentOrder];
    newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, draggedId);

    dispatch({ type: "REORDER_LAYERS", layerIds: newOrder });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div
      onDrop={handleFileDrop}
      onDragOver={handleDragOverFile}
      onDragLeave={handleDragLeaveFile}
      className={cn(
        "w-[280px] border-r border-border bg-card flex flex-col flex-shrink-0 relative",
        "transition-all duration-200"
      )}
    >
        {isDragOver && (
          <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-dashed border-primary rounded-md flex flex-col items-center justify-center gap-2 pointer-events-none">
            <Upload className="w-8 h-8 text-primary" />
            <span className="text-xs font-medium text-primary">Drop GeoJSON here</span>
          </div>
        )}

        <div className="p-3 border-b border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Layers
            </span>
            <span className="text-[10px] text-muted-foreground">
              {state.layers.length}
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter layers..."
              className="h-7 pl-7 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {state.layers.length === 0 ? "Drop GeoJSON or click Add Layer" : "No matching layers"}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((layer) => {
                const color = getLayerColor(layer.style);
                const isSelected = state.selectedLayerId === layer.id;

                return (
                  <LayerRow
                    key={layer.id}
                    layer={layer}
                    color={color}
                    isSelected={isSelected}
                    isDragged={draggedId === layer.id}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    onSelect={() => dispatch({ type: "SELECT_LAYER", layerId: isSelected ? null : layer.id })}
                    onToggleVisibility={() => dispatch({ type: "TOGGLE_LAYER_VISIBILITY", layerId: layer.id })}
                    onRemove={() => dispatch({ type: "REMOVE_LAYER", layerId: layer.id })}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs gap-1.5"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Layer
          </Button>
        </div>
      <AddLayerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        layerLibrary={layerLibrary}
        existingLayerIds={state.layers.map((l) => l.layerId)}
        onAddFromLibrary={(id) => {
          onAddFromLibrary(id);
          setAddDialogOpen(false);
        }}
        onAddInline={(name, type, geoJson) => {
          onAddInline(name, type, geoJson);
          setAddDialogOpen(false);
        }}
      />
    </div>
  );
}
