"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateMap, createMap } from "../actions/maps";
import { v4 as uuidv4 } from 'uuid';

// Loop-style components
import { LoopStyleEditor, SidebarCard, SidebarField } from "@/app/admin/components/content/loop-style-editor";
import { GhostInput } from "@/app/admin/components/content/ghost-input";

// Map components
import { ConfigPanel } from "@/components/map-components/config-panel";
import { MapPreview } from "@/components/map-components/map-preview";
import type { MapConfig, LayerConfig } from "../maps/types/config.types";
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from "@/components/map-components/default-styles";

// Form
import { mapSchema, MapFormValues } from "@/app/admin/schema/map";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SearchableSelect, TagInput } from "@/app/admin/components/content/searchable-select";

const DEFAULT_MAP_CONFIG: MapConfig = {
  center: [51.505, -0.09],
  zoom: 6,
  tile: {
    src: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 20,
    subdomains: 'abcd'
  },
  layers: []
};

interface LoopMapEditorProps {
  map?: any;
  categories?: any[];
  tags?: any[];
  regions?: any[];
}

export function LoopMapEditor({ map, categories = [], tags = [], regions = [] }: LoopMapEditorProps) {
  const router = useRouter();
  const actualMode = map ? "edit" : "create";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "he">("en");
  
  // Build initial config from map data
  const buildInitialConfig = (): MapConfig => {
    const baseConfig = map?.config && Object.keys(map.config).length > 0 
      ? (map.config as unknown as MapConfig) 
      : DEFAULT_MAP_CONFIG;

    if (map && (map as any).layers && Array.isArray((map as any).layers)) {
      const dbLayers = (map as any).layers;
      
      const reconstructedLayers = dbLayers.map((dbLayer: any) => {
        const layer = {
          id: dbLayer.id,
          name: (dbLayer.nameI18n as any)?.en || 'Untitled Layer',
          type: dbLayer.type === 'POINTS' ? 'point' : 'polygon',
          sourceType: dbLayer.sourceType || 'url',
          visible: dbLayer.isVisibleByDefault,
          url: dbLayer.sourceUrl,
          data: dbLayer.geoJsonData || null,
          style: dbLayer.styleConfig?.style || (dbLayer.type === 'POINTS' ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE),
          labels: dbLayer.styleConfig?.labels,
          popup: dbLayer.styleConfig?.popup,
          filter: dbLayer.styleConfig?.filter,
        };
        return layer;
      });

      return {
        ...baseConfig,
        layers: reconstructedLayers
      };
    }

    return baseConfig;
  };

  const [mapConfig, setMapConfig] = useState<MapConfig>(buildInitialConfig());

  const categoryOptions = categories.map((c: any) => ({
    value: c.id,
    label: c.title || c.name || "Untitled",
  }));

  const allTagNames = tags.map((t: any) => t.name);
  const [mapTagNames, setMapTagNames] = useState<string[]>(
    map?.tags?.map((t: any) => t.name) || []
  );

  const [regionIds, setRegionIds] = useState<string[]>(
    map?.regions?.map((r: any) => r.id) || []
  );

  const form = useForm<MapFormValues>({
    resolver: zodResolver(mapSchema),
    defaultValues: {
      title_i18n: map?.titleI18n || map?.title_i18n || { en: "", he: "" },
      description_i18n: map?.descriptionI18n || map?.description_i18n || { en: "", he: "" },
      slug: map?.slug || "",
      status: map?.status || "draft",
      version: map?.version || "1.0.0",
      yearMin: map?.yearMin?.toString() || "",
      yearMax: map?.yearMax?.toString() || "",
      year: map?.year?.toString() || "",
      period: map?.period || "",
      categoryId: map?.categoryId || map?.category?.id || "",
      tagIds: map?.tags?.map((t: any) => t.id) || [],
      regionIds: map?.regions?.map((r: any) => r.id) || [],
      thumbnailId: map?.thumbnailId || map?.thumbnail?.id || null,
      globalStyleConfig: map?.globalStyleConfig || null,
      referenceLinks: (map?.referenceLinks as unknown[]) || [],
      period_start_date: map?.period_start_date
        ? new Date(map.period_start_date).toISOString().split("T")[0]
        : "",
      period_end_date: map?.period_end_date
        ? new Date(map.period_end_date).toISOString().split("T")[0]
        : "",
      config: mapConfig,
    },
  });

  // Sync mapConfig to form
  useEffect(() => {
    form.setValue("config", mapConfig as any);
    setIsDirty(true);
  }, [mapConfig, form]);

  // Track form changes
  useEffect(() => {
    const subscription = form.watch(() => setIsDirty(true));
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(data: MapFormValues) {
    setIsSubmitting(true);
    
    try {
      const resolvedTagIds = mapTagNames.map((name) => {
        const found = tags.find((t: any) => t.name === name);
        return found?.id;
      }).filter(Boolean) as string[];

      const submitData: any = {
        ...data,
        config: data.config || mapConfig,
        yearMin: data.yearMin ? parseInt(data.yearMin, 10) : null,
        yearMax: data.yearMax ? parseInt(data.yearMax, 10) : null,
        year: data.year ? parseInt(data.year, 10) : null,
        period: data.period || null,
        categoryId: data.categoryId || null,
        tagIds: resolvedTagIds,
        regionIds,
        thumbnailId: data.thumbnailId || null,
        globalStyleConfig: data.globalStyleConfig || null,
        referenceLinks: data.referenceLinks || null,
      };

      if (actualMode === "create") {
        toast.loading("Creating map...", { id: "map-save" });
        const result = await createMap(submitData);
        
        if (result && result.id) {
          toast.success("Map created successfully!", { id: "map-save" });
          setIsDirty(false);
          router.push(`/admin/maps/${result.id}`);
        } else {
          toast.error("Failed to create map", { id: "map-save" });
        }
      } else {
        if (!map || !map.id) {
          toast.error("Map ID is missing", { id: "map-save" });
          return;
        }
        
        toast.loading("Updating map...", { id: "map-save" });
        const result = await updateMap(map.id, submitData);
        
        if (result && result.id) {
          toast.success("Map updated successfully!", { id: "map-save" });
          setIsDirty(false);
          router.refresh();
        } else {
          toast.error("Failed to update map", { id: "map-save" });
        }
      }
    } catch (error) {
      console.error("Map save error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while saving", { id: "map-save" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Map config handlers
  const handleUpdateTile = (tile: Partial<MapConfig['tile']>) => {
    setMapConfig(prev => ({ ...prev, tile: { ...prev.tile, ...tile } }));
  };

  const handleUpdateZoom = (zoom: number) => {
    setMapConfig(prev => ({ ...prev, zoom }));
  };

  const handleUpdateCenter = (center: [number, number]) => {
    setMapConfig(prev => ({ ...prev, center }));
  };

  const handleAddLayer = (layer: Omit<LayerConfig, 'id'>) => {
    const newId = uuidv4();
    const newLayer = { ...layer, id: newId } as LayerConfig;
    setMapConfig(prev => ({
      ...prev,
      layers: [...(prev.layers || []), newLayer]
    }));
    return newId;
  };

  const handleUpdateLayer = (id: string, updates: Partial<LayerConfig>) => {
    setMapConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l)
    }));
  };

  const handleRemoveLayer = (id: string) => {
    setMapConfig(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id)
    }));
  };

  const handleToggleLayerVisibility = (id: string) => {
    setMapConfig(prev => ({
      ...prev,
      layers: prev.layers.map(l => 
        l.id === id ? { ...l, visible: !l.visible } : l
      )
    }));
  };

  const handleDuplicateLayer = (id: string) => {
    const layer = mapConfig.layers.find(l => l.id === id);
    if (layer) {
      const newLayer = {
        ...layer,
        id: uuidv4(),
        name: `${layer.name} (Copy)`
      };
      setMapConfig(prev => ({
        ...prev,
        layers: [...prev.layers, newLayer]
      }));
    }
  };

  const titleValue = form.watch(`title_i18n.${currentLanguage}`) || "";
  const descriptionValue = form.watch(`description_i18n.${currentLanguage}`) || "";
  const slugValue = form.watch("slug") || "";

  return (
    <LoopStyleEditor
      backHref="/admin/maps"
      onSave={form.handleSubmit(onSubmit as any)}
      saving={isSubmitting}
      isDirty={isDirty}
      languages={[
        { code: "en", label: "English", flag: "🇬🇧" },
        { code: "he", label: "עברית", flag: "🇮🇱" },
      ]}
      currentLanguage={currentLanguage}
      onLanguageChange={(lang) => setCurrentLanguage(lang as "en" | "he")}
      showLanguageToggle={true}
      fullWidth={true}
      sidebar={
        <div className="space-y-4">
          {/* Metadata Card */}
          <SidebarCard title="Metadata">
            <div className="space-y-4">
              <SidebarField label="Status">
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) => form.setValue("status", value as any)}
                >
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </SidebarField>

              <SidebarField label="Slug">
                <Input
                  value={slugValue}
                  onChange={(e) => form.setValue("slug", e.target.value)}
                  placeholder="map-slug"
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>

              <SidebarField label="Version">
                <Input
                  value={form.watch("version")}
                  onChange={(e) => form.setValue("version", e.target.value)}
                  placeholder="1.0.0"
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>

              <SidebarField label="Year">
                <Input
                  type="number"
                  value={form.watch("year") || ""}
                  onChange={(e) => form.setValue("year", e.target.value)}
                  placeholder="1850"
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>

              <SidebarField label="Year Min">
                <Input
                  type="number"
                  value={form.watch("yearMin")}
                  onChange={(e) => form.setValue("yearMin", e.target.value)}
                  placeholder="1750"
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>

              <SidebarField label="Year Max">
                <Input
                  type="number"
                  value={form.watch("yearMax")}
                  onChange={(e) => form.setValue("yearMax", e.target.value)}
                  placeholder="1939"
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>

              <SidebarField label="Period">
                <Input
                  value={form.watch("period") || ""}
                  onChange={(e) => form.setValue("period", e.target.value)}
                  placeholder="e.g. Interwar"
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>
            </div>
          </SidebarCard>

          {/* Classification Card */}
          <SidebarCard title="Classification">
            <div className="space-y-4">
              <SidebarField label="Category">
                <SearchableSelect
                  value={form.watch("categoryId") || ""}
                  onValueChange={(value) => form.setValue("categoryId", value || "")}
                  options={categoryOptions}
                  placeholder="Select category..."
                  searchPlaceholder="Search categories..."
                />
              </SidebarField>

              <SidebarField label="Tags">
                <TagInput
                  value={mapTagNames}
                  onChange={(newTags) => {
                    setMapTagNames(newTags);
                    setIsDirty(true);
                  }}
                  suggestions={allTagNames}
                  placeholder="Add tags..."
                />
              </SidebarField>
            </div>
          </SidebarCard>

          {/* Regions Card */}
          <SidebarCard title="Regions">
            <div className="space-y-2">
              {regions.map((r: any) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={regionIds.includes(r.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked
                        ? [...regionIds, r.id]
                        : regionIds.filter((id) => id !== r.id);
                      setRegionIds(newIds);
                      form.setValue("regionIds", newIds);
                      setIsDirty(true);
                    }}
                    className="rounded border-border"
                  />
                  {r.name}
                </label>
              ))}
              {regions.length === 0 && (
                <p className="text-xs text-muted-foreground">No regions available</p>
              )}
            </div>
          </SidebarCard>

          {/* Time Period Card */}
          <SidebarCard title="Time Period">
            <div className="space-y-4">
              <SidebarField label="Start Date">
                <Input
                  type="date"
                  value={form.watch("period_start_date")}
                  onChange={(e) => form.setValue("period_start_date", e.target.value)}
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>

              <SidebarField label="End Date">
                <Input
                  type="date"
                  value={form.watch("period_end_date")}
                  onChange={(e) => form.setValue("period_end_date", e.target.value)}
                  className="bg-secondary border-border text-foreground"
                />
              </SidebarField>
            </div>
          </SidebarCard>

          {/* Map Config Card */}
          <SidebarCard title="Map Configuration">
            <ConfigPanel 
              config={mapConfig}
              onUpdateTile={handleUpdateTile}
              onUpdateZoom={handleUpdateZoom}
              onUpdateCenter={handleUpdateCenter}
              onAddLayer={handleAddLayer}
              onUpdateLayer={handleUpdateLayer}
              onRemoveLayer={handleRemoveLayer}
              onToggleLayerVisibility={handleToggleLayerVisibility}
              onDuplicateLayer={handleDuplicateLayer}
            />
          </SidebarCard>
        </div>
      }
    >
      {/* Canvas - Title, Description, Map */}
      <div className="space-y-8">
        {/* Title */}
        <GhostInput
          value={titleValue}
          onChange={(e) => form.setValue(`title_i18n.${currentLanguage}`, e.target.value)}
          placeholder="Map Title"
          className="text-4xl font-bold"
          inputSize="title"
        />

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Description
          </label>
          <Textarea
            value={descriptionValue}
            onChange={(e) => form.setValue(`description_i18n.${currentLanguage}`, e.target.value)}
            placeholder="Add a description for this map..."
            className="min-h-[100px] bg-transparent border-border text-foreground resize-none"
          />
        </div>

        {/* Map Preview */}
        <div className="rounded-lg overflow-hidden border border-border">
          <MapPreview config={mapConfig} />
        </div>
      </div>
    </LoopStyleEditor>
  );
}
