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
}

export function LoopMapEditor({ map }: LoopMapEditorProps) {
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

  const form = useForm<MapFormValues>({
    resolver: zodResolver(mapSchema),
    defaultValues: {
      title_i18n: map?.titleI18n || map?.title_i18n || { en: "", he: "" },
      description_i18n: map?.descriptionI18n || map?.description_i18n || { en: "", he: "" },
      slug: map?.slug || "",
      status: map?.status || "draft",
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
    form.setValue("config", mapConfig);
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
      const submitData = {
        ...data,
        config: data.config || mapConfig
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
    } catch (error: any) {
      console.error("Map save error:", error);
      toast.error(error.message || "An error occurred while saving", { id: "map-save" });
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
      onSave={form.handleSubmit(onSubmit)}
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
                  <SelectTrigger className="bg-[#252525] border-white/10 text-white/80">
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
                  className="bg-[#252525] border-white/10 text-white/80"
                />
              </SidebarField>
            </div>
          </SidebarCard>

          {/* Period Card */}
          <SidebarCard title="Time Period">
            <div className="space-y-4">
              <SidebarField label="Start Date">
                <Input
                  type="date"
                  value={form.watch("period_start_date")}
                  onChange={(e) => form.setValue("period_start_date", e.target.value)}
                  className="bg-[#252525] border-white/10 text-white/80"
                />
              </SidebarField>
              
              <SidebarField label="End Date">
                <Input
                  type="date"
                  value={form.watch("period_end_date")}
                  onChange={(e) => form.setValue("period_end_date", e.target.value)}
                  className="bg-[#252525] border-white/10 text-white/80"
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
          <label className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Description
          </label>
          <Textarea
            value={descriptionValue}
            onChange={(e) => form.setValue(`description_i18n.${currentLanguage}`, e.target.value)}
            placeholder="Add a description for this map..."
            className="min-h-[100px] bg-transparent border-white/10 text-white/80 resize-none"
          />
        </div>

        {/* Map Preview */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <MapPreview config={mapConfig} />
        </div>
      </div>
    </LoopStyleEditor>
  );
}
