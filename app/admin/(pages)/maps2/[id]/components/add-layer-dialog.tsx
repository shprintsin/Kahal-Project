"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Circle, Database, Hexagon, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import type { StudioLayer } from "../store";
import type { FeatureCollection } from "geojson";

interface AddLayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layerLibrary: { id: string; name: string; slug: string; type: string; featureCount: number }[];
  existingLayerIds: string[];
  onAddFromLibrary: (layerId: string) => void;
  onAddInline: (name: string, type: StudioLayer["type"], geoJson: FeatureCollection) => void;
}

function detectGeometryType(geoJson: FeatureCollection): StudioLayer["type"] {
  const first = geoJson.features?.[0];
  if (!first) return "POLYGONS";
  const gType = first.geometry?.type;
  if (gType === "Point" || gType === "MultiPoint") return "POINTS";
  if (gType === "LineString" || gType === "MultiLineString") return "POLYLINES";
  return "POLYGONS";
}

export function AddLayerDialog({
  open,
  onOpenChange,
  layerLibrary,
  existingLayerIds,
  onAddFromLibrary,
  onAddInline,
}: AddLayerDialogProps) {
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<StudioLayer["type"]>("POLYGONS");
  const [uploadedGeoJson, setUploadedGeoJson] = useState<FeatureCollection | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const available = layerLibrary.filter(
    (l) =>
      !existingLayerIds.includes(l.id) &&
      (search
        ? l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.slug.toLowerCase().includes(search.toLowerCase())
        : true)
  );

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.type === "FeatureCollection" && Array.isArray(json.features)) {
          setUploadedGeoJson(json);
          setUploadedFileName(file.name);
          const detected = detectGeometryType(json);
          setNewType(detected);
          if (!newName) {
            setNewName(file.name.replace(/\.geojson$|\.json$/i, ""));
          }
          toast.success(`${json.features.length} features loaded`);
        } else {
          toast.error("Invalid GeoJSON: expected FeatureCollection");
        }
      } catch {
        toast.error("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  }, [newName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.type === "FeatureCollection") {
          setUploadedGeoJson(json);
          setUploadedFileName(file.name);
          setNewType(detectGeometryType(json));
          if (!newName) setNewName(file.name.replace(/\.geojson$|\.json$/i, ""));
        }
      } catch {
        toast.error("Invalid JSON");
      }
    };
    reader.readAsText(file);
  }, [newName]);

  const handleCreateLayer = () => {
    if (!newName.trim() || !uploadedGeoJson) {
      toast.error("Name and GeoJSON data required");
      return;
    }
    onAddInline(newName.trim(), newType, uploadedGeoJson);
    setNewName("");
    setUploadedGeoJson(null);
    setUploadedFileName("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Layer</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library">
          <TabsList className="w-full">
            <TabsTrigger value="library" className="flex-1 gap-1.5 text-xs">
              <Database className="w-3.5 h-3.5" />
              From Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1 gap-1.5 text-xs">
              <Upload className="w-3.5 h-3.5" />
              Upload GeoJSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-3 mt-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search layers..."
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1">
              {available.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  {layerLibrary.length === 0
                    ? "No layers in library"
                    : "All layers already added or no matches"}
                </div>
              ) : (
                available.map((layer) => {
                  const Icon = layer.type === "POINTS" ? Circle : Hexagon;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onAddFromLibrary(layer.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/80 transition-colors text-left"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{layer.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {layer.slug}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                        {layer.featureCount} features
                      </Badge>
                    </button>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label className="text-xs">Layer Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Poland Boundaries"
                className="h-8 text-sm"
              />
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors hover:border-primary/50"
            >
              {uploadedGeoJson ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{uploadedFileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedGeoJson.features.length} features &middot; {newType}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Drop GeoJSON file here or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".json,.geojson"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="geojson-upload"
                  />
                  <Button asChild variant="secondary" size="sm" className="text-xs">
                    <label htmlFor="geojson-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleCreateLayer}
              disabled={!newName.trim() || !uploadedGeoJson}
              className="w-full h-9"
            >
              Add Layer
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
