"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateMap, createMap } from "../actions/maps";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Loader2, Map as MapIcon } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

// New Components
import { ConfigPanel } from "@/components/map-components/config-panel";
import { MapPreview } from "@/components/map-components/map-preview";
import type { MapConfig, LayerConfig } from "../maps/types/config.types";
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from "@/components/map-components/default-styles";
import { FormSection } from "@/app/admin/components/editors/form-field-renderer";
import { createMapFieldConfigs } from "@/app/admin/maps/field-configs";
import { mapSchema, MapFormValues } from "@/app/admin/schema/map";

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

interface MapEditorProps {
  map?: any; // Replace 'any' with your Prisma types if available
  mode?: "create" | "edit";
}

export function MapEditor({ map, mode }: MapEditorProps) {
  const router = useRouter();

  // Auto-detect mode if not provided
  const actualMode = mode || (map ? "edit" : "create");

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Build initial config from map data
  const buildInitialConfig = (): MapConfig => {
    const baseConfig = map?.config && Object.keys(map.config).length > 0 
      ? (map.config as unknown as MapConfig) 
      : DEFAULT_MAP_CONFIG;

    // If we have a map with layers from the database, reconstruct them
    if (map && (map as any).layers && Array.isArray((map as any).layers)) {
      const dbLayers = (map as any).layers;
      // console.log(`Loading ${dbLayers.length} layers from database`);
      // console.log('Database layers:', JSON.stringify(dbLayers, null, 2));
      
      const reconstructedLayers = dbLayers.map((dbLayer: any) => {
        const layer = {
          id: dbLayer.id,
          name: (dbLayer.nameI18n as any)?.en || 'Untitled Layer',
          type: dbLayer.type === 'POINTS' ? 'point' : 'polygon', // Convert from DB enum to frontend format
          sourceType: dbLayer.sourceType || 'url', // Add sourceType
          visible: dbLayer.isVisibleByDefault,
          url: dbLayer.sourceUrl, // R2 URL (may be null for database-stored layers)
          data: dbLayer.geoJsonData || null, // GeoJSON data from database
          style: dbLayer.styleConfig?.style || (dbLayer.type === 'POINTS' ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE),
          labels: dbLayer.styleConfig?.labels,
          popup: dbLayer.styleConfig?.popup,
          filter: dbLayer.styleConfig?.filter,
        };
        // console.log(`Reconstructed layer "${layer.name}":`, { 
          sourceType: layer.sourceType, 
          hasUrl: !!layer.url, 
          hasData: !!layer.data,
          featureCount: layer.data?.features?.length || 0
        });
        return layer;
      });

      return {
        ...baseConfig,
        layers: reconstructedLayers
      };
    }

    return baseConfig;
  };

  // State for the Visual Editor
  const [mapConfig, setMapConfig] = useState<MapConfig>(buildInitialConfig());

  // Create field configs
  const fieldConfigs = createMapFieldConfigs();

  const form = useForm<MapFormValues>({
    resolver: zodResolver(mapSchema),
    defaultValues: {
      title_i18n: map?.titleI18n || map?.title_i18n || { en: "" },
      description_i18n: map?.descriptionI18n || map?.description_i18n || { en: "" },
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

  // Sync mapConfig to form whenever it changes
  useEffect(() => {
    form.setValue("config", mapConfig);
  }, [mapConfig, form]);

  async function onSubmit(data: MapFormValues) {
    setIsSubmitting(true);
    
    try {
      // console.log("Submitting map data:", {
        ...data,
        config: data.config ? "Config present with " + (data.config.layers?.length || 0) + " layers" : "No config"
      });

      // Ensure config is properly serialized
      const submitData = {
        ...data,
        config: data.config || mapConfig
      };

      if (actualMode === "create") {
        toast.loading("Creating map...", { id: "map-save" });
        const result = await createMap(submitData);
        
        if (result && result.id) {
          toast.success("Map created successfully!", { id: "map-save" });
          // console.log("Map created:", result);
          router.push(`/admin/maps/${result.id}`);
        } else {
          toast.error("Failed to create map - no ID returned", { id: "map-save" });
          console.error("Create result:", result);
        }
      } else {
        if (!map || !map.id) {
          toast.error("Map ID is missing. Cannot update.", { id: "map-save" });
          console.error("Map object:", map);
          return;
        }
        
        toast.loading("Updating map...", { id: "map-save" });
        const result = await updateMap(map.id, submitData);
        
        if (result && result.id) {
          toast.success("Map updated successfully!", { id: "map-save" });
          // console.log("Map updated:", result);
          router.refresh();
        } else {
          toast.error("Failed to update map - no response", { id: "map-save" });
          console.error("Update result:", result);
        }
      }
    } catch (error: any) {
      console.error("Map save error:", error);
      toast.error(error.message || "An error occurred while saving", { id: "map-save" });
    } finally {
      setIsSubmitting(false);
    }
  }

  // --- Handlers for ConfigPanel ---

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


  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <h1 className="text-2xl font-bold">
          {actualMode === "create" ? "Create Map" : "Edit Map"}
        </h1>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[400px] border-r bg-background flex flex-col overflow-hidden">
            <Tabs defaultValue="visuals" className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 pt-4 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="metadata" className="flex items-center gap-2">
                       <LayoutDashboard className="w-4 h-4"/> Metadata
                    </TabsTrigger>
                    <TabsTrigger value="visuals" className="flex items-center gap-2">
                       <MapIcon className="w-4 h-4"/> Layers & Style
                    </TabsTrigger>
                  </TabsList>
              </div>

              {/* Metadata Tab Content */}
              <TabsContent value="metadata" className="flex-1 relative m-0 data-[state=inactive]:hidden">
                 <div className="absolute inset-0 bg-background overflow-y-auto">
                   <div className="p-4 space-y-6">
                     <Form {...form}>
                        <form className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold text-muted-foreground">Basic Information</h3>
                              <FormSection
                                control={form.control as any}
                                fields={fieldConfigs.basicInfo}
                                columns={1}
                              />
                            </div>

                            {/* Temporal Information */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold text-muted-foreground">Temporal Information</h3>
                              <FormSection
                                control={form.control as any}
                                fields={fieldConfigs.temporal}
                                columns={2}
                              />
                            </div>
                            
                            {/* Raw Config Debug (Optional/Advanced) */}
                            <div className="pt-4 border-t space-y-2 pb-4">
                                 <FormLabel>Raw Config (Read-only Preview)</FormLabel>
                                 <Textarea 
                                    value={JSON.stringify(mapConfig, null, 2)} 
                                    readOnly 
                                    className="font-mono text-xs h-40 bg-muted"
                                 />
                            </div>
                        </form>
                     </Form>
                   </div>
                 </div>
              </TabsContent>

              {/* Visuals Tab Content */}
              <TabsContent value="visuals" className="flex-1 relative m-0 data-[state=inactive]:hidden">
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
              </TabsContent>
            </Tabs>
        </div>

        {/* Main Content: Map Preview */}
        <div className="flex-1 bg-muted/20 p-4 overflow-hidden relative">
            <MapPreview config={mapConfig} />
        </div>
      </div>
    </div>
  );
}
