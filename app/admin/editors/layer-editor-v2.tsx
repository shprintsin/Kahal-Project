"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { layerSchema, type LayerFormValues } from "@/app/admin/schema/layer";
import { createLayer, updateLayer, deleteLayer } from "@/app/admin/actions/layers";
import { createLayerFieldConfigs } from "@/app/admin/layers/field-configs";
import { MapPreview, type MapPreviewHandle } from "@/components/map-components/map-preview";
import { Trash2, Save, GripVertical, Camera, Plus } from "lucide-react";
import { UnifiedCanvasSeparator } from "@/app/admin/components/content/unified-canvas";
import { FileTree, type FileTreeItem } from "@/app/admin/components/content/file-tree";
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from "@/components/map-components/default-styles";
import { cn } from "@/lib/utils";
import { generateSlugFromTitle } from "@/app/admin/utils/slug-generator";
import { autoResizeElement } from "@/app/admin/hooks/useAutoResize";
import { LayerEditorSidebar } from "./layer-editor-sidebar";
import { ThumbnailDialog } from "./layer-editor-thumbnail";

interface LayerEditorProps {
  layer?: any;
  mode: "create" | "edit";
  allLayers?: any[];
}

export function LayerEditorV2({ layer, mode, allLayers: initialLayers = [] }: LayerEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(layer?.geoJsonData || null);
  const [allLayers] = useState<any[]>(initialLayers);
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);
  const [showThumbnailDialog, setShowThumbnailDialog] = useState(false);
  const mapPreviewComponentRef = useRef<MapPreviewHandle>(null);

  const actualMode = mode || (layer ? "edit" : "create");

  const fileTreeItems: FileTreeItem[] = useMemo(() => {
    const byStatus: Record<string, any[]> = { published: [], draft: [], archived: [] };
    allLayers.forEach(l => {
      const s = l.status || "draft";
      if (!byStatus[s]) byStatus[s] = [];
      byStatus[s].push(l);
    });

    const items: FileTreeItem[] = [];
    Object.entries(byStatus).forEach(([status, layers]) => {
      if (layers.length > 0) {
        items.push({
          id: status,
          name: status.charAt(0).toUpperCase() + status.slice(1),
          type: "folder",
          children: layers.map((l: any) => ({
            id: l.id,
            name: l.name || "Untitled",
            type: "file",
            path: `/layers/${l.id}`,
          })),
        });
      }
    });
    return items;
  }, [allLayers]);

  const form = useForm<LayerFormValues>({
    resolver: zodResolver(layerSchema),
    defaultValues: {
      slug: layer?.slug || "",
      name: layer?.name || "",
      name_i18n: layer?.nameI18n || {},
      description: layer?.description || "",
      description_i18n: layer?.descriptionI18n || {},
      status: layer?.status || "draft",
      version: layer?.version || "1.0.0",
      categoryId: layer?.categoryId || undefined,
      type: layer?.type || "POINTS",
      citationText: layer?.citationText || "",
      citation_text_i18n: layer?.citationTextI18n || {},
      codebookText: layer?.codebookText || "",
      codebook_text_i18n: layer?.codebookTextI18n || {},
      sources: layer?.sources || "",
      sources_i18n: layer?.sourcesI18n || {},
      license: layer?.license || "",
      maturity: layer?.maturity || "Provisional",
      minYear: layer?.minYear || undefined,
      maxYear: layer?.maxYear || undefined,
      sourceType: layer?.sourceType || "database",
      sourceUrl: layer?.sourceUrl || "",
      downloadUrl: layer?.downloadUrl || "",
      styleConfig: layer?.styleConfig || {},
      tagIds: layer?.tags?.map((t: any) => t.id) || [],
      regionIds: layer?.regions?.map((r: any) => r.id) || [],
    },
  });

  const layerType = form.watch("type");
  const styleConfig = form.watch("styleConfig");
  const formName = form.watch("name");
  const formDescription = form.watch("description");
  const formSlug = form.watch("slug");
  const citationText = form.watch("citationText");
  const codebookText = form.watch("codebookText");
  const sources = form.watch("sources");

  const fieldConfigs = createLayerFieldConfigs();

  const [mapSettings, setMapSettings] = useState(() => {
    const savedPreview = layer?.styleConfig?.previewSettings;
    if (savedPreview?.tile && savedPreview?.zoom && savedPreview?.center) return savedPreview;
    return {
      tile: { src: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", maxZoom: 18, subdomains: "abc", attribution: '© OpenStreetMap contributors' },
      zoom: 6,
      center: [52.0, 20.0] as [number, number],
    };
  });

  const currentLayerType = layerType === "POINTS" ? "point" : "polygon";

  const previewConfig = useMemo(() => {
    if (!geoJsonData) return null;
    const defaultStyle = currentLayerType === "point" ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE;
    return {
      ...mapSettings,
      layers: [{
        id: "preview", name: formName || "Preview", type: currentLayerType,
        data: geoJsonData, visible: true,
        style: styleConfig?.style || defaultStyle,
        labels: styleConfig?.labels, popup: styleConfig?.popup,
        filter: styleConfig?.filter, hover: styleConfig?.hover,
      }],
    };
  }, [mapSettings, geoJsonData, currentLayerType, styleConfig, formName]);

  const configLayer = {
    id: "preview", name: formName || "Preview",
    type: currentLayerType as "point" | "polygon",
    data: geoJsonData, ...styleConfig,
    style: styleConfig?.style || (currentLayerType === "point" ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE),
  };

  const handleUpdateTile = (tile: any) => setMapSettings((prev: any) => ({ ...prev, tile: { ...prev.tile, ...tile } }));
  const handleUpdateZoom = (zoom: number) => setMapSettings((prev: any) => ({ ...prev, zoom }));
  const handleUpdateCenter = (center: [number, number]) => setMapSettings((prev: any) => ({ ...prev, center }));
  const handleUpdateLayerConfig = (updates: any) => {
    const current = form.getValues("styleConfig") || {};
    form.setValue("styleConfig", { ...current, ...updates }, { shouldDirty: true, shouldValidate: true });
  };

  async function onSubmit(data: LayerFormValues) {
    setIsSubmitting(true);
    try {
      const submitData: any = { ...data, geoJsonData, styleConfig: { ...data.styleConfig, previewSettings: mapSettings } };
      if (actualMode === "create") {
        toast.loading("Creating layer...", { id: "layer-save" });
        const result = await createLayer(submitData);
        if (result?.id) {
          toast.success("Layer created successfully!", { id: "layer-save" });
          router.push(`/admin/layers/${result.id}`);
        } else {
          toast.error("Failed to create layer", { id: "layer-save" });
        }
      } else if (layer) {
        toast.loading("Updating layer...", { id: "layer-save" });
        await updateLayer(layer.id, submitData);
        toast.success("Layer updated successfully!", { id: "layer-save" });
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving layer:", error);
      toast.error("Failed to save layer", { id: "layer-save" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!layer || !confirm("Are you sure you want to delete this layer? This action cannot be undone.")) return;
    try {
      toast.loading("Deleting layer...", { id: "layer-delete" });
      await deleteLayer(layer.id);
      toast.success("Layer deleted successfully!", { id: "layer-delete" });
      router.push("/admin/layers");
    } catch (error) {
      console.error("Error deleting layer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete layer", { id: "layer-delete" });
    }
  }

  async function handleCaptureThumbnail() {
    if (!geoJsonData) { toast.error("Please upload GeoJSON data first"); return; }
    const mapInstance = mapPreviewComponentRef.current?.getMapInstance();
    if (!mapInstance) { toast.error("Map not loaded yet. Please wait and try again."); return; }

    try {
      toast.loading("Capturing thumbnail...", { id: "thumbnail-capture" });
      await new Promise(resolve => setTimeout(resolve, 500));
      const SimpleMapScreenshoter = (await import('leaflet-simple-map-screenshoter')).default;
      const screenshoter = new (SimpleMapScreenshoter as any)({ hidden: true, preventDownload: true });
      screenshoter.addTo(mapInstance);
      screenshoter.takeScreen('image').then((dataUrl: string) => {
        setCapturedThumbnail(dataUrl);
        setShowThumbnailDialog(true);
        toast.success("Thumbnail captured!", { id: "thumbnail-capture" });
        screenshoter.remove();
      }).catch((error: any) => {
        console.error('[Thumbnail] Screenshot failed:', error);
        toast.error("Failed to capture thumbnail", { id: "thumbnail-capture" });
        screenshoter.remove();
      });
    } catch (error) {
      console.error("[Thumbnail] Error:", error);
      toast.error("Failed to capture thumbnail", { id: "thumbnail-capture" });
    }
  }

  const canvasTextareaClass = cn(
    "w-full bg-transparent border-none outline-none resize-none",
    "text-base text-white/70 leading-[1.6]",
    "placeholder:text-white/15",
    "focus:ring-0 min-h-[80px] py-4",
    "border-b border-white/5"
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-sidebar-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            {geoJsonData && (
              <Button type="button" variant="ghost" size="sm" onClick={handleCaptureThumbnail} disabled={isSubmitting} className="h-8 gap-1.5">
                <Camera className="h-4 w-4" /><span className="hidden sm:inline">Thumbnail</span>
              </Button>
            )}
            {actualMode === "edit" && layer && (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isSubmitting} className="h-8 text-destructive gap-1.5">
                <Trash2 className="h-4 w-4" /><span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting} size="sm" className="h-8 gap-1.5">
              <Save className="h-4 w-4" />{isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Tree */}
        <div className="w-[280px] border-r border-white/5 bg-[#1e1e1e] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wide px-2">Layers</span>
            <Button variant="ghost" size="icon" onClick={() => router.push("/admin/layers/new")} className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree
              items={fileTreeItems}
              currentFileId={layer?.id}
              onFileSelect={(item) => item.path && router.push(`/admin${item.path}`)}
              onFileCreate={() => router.push("/admin/layers/new")}
            />
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 bg-background overflow-y-auto">
          <div className="max-w-3xl mx-auto px-12 py-12 space-y-0">
            <input
              type="text"
              value={formName}
              onChange={(e) => {
                form.setValue("name", e.target.value);
                const autoSlug = generateSlugFromTitle(e.target.value);
                if (autoSlug && (actualMode === "create" || !form.getValues("slug"))) {
                  form.setValue("slug", autoSlug, { shouldDirty: true });
                }
              }}
              placeholder="Layer Title"
              className="w-full bg-transparent border-none outline-none text-4xl font-bold text-white placeholder:text-white/20 py-2 focus:ring-0"
            />

            <div className="flex items-center py-2 border-b border-white/5">
              <span className="text-white/30 text-sm font-mono select-none">/layers/</span>
              <input
                type="text"
                value={formSlug}
                onChange={(e) => form.setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="layer-slug"
                className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white/60 placeholder:text-white/20 focus:ring-0"
              />
            </div>

            <UnifiedCanvasSeparator label="Map Preview" />
            <div className="rounded-lg overflow-hidden border border-white/10 my-8" style={{ height: '600px' }}>
              {previewConfig ? (
                <MapPreview ref={mapPreviewComponentRef} config={previewConfig} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <div className="p-4 bg-white/5 rounded-full mb-4"><GripVertical className="w-6 h-6 opacity-50" /></div>
                  <p>Upload GeoJSON data in the sidebar to see a preview</p>
                </div>
              )}
            </div>

            <UnifiedCanvasSeparator label="Description" />
            <textarea
              value={formDescription}
              onChange={(e) => { form.setValue("description", e.target.value); autoResizeElement(e.target, 60); }}
              placeholder="Add a brief description of this layer..."
              rows={2}
              className={cn(canvasTextareaClass, "text-lg text-white/70 leading-relaxed min-h-[60px]")}
            />

            <UnifiedCanvasSeparator label="Citation" />
            <textarea value={citationText} onChange={(e) => { form.setValue("citationText", e.target.value); autoResizeElement(e.target, 80); }} placeholder="Add citation information..." rows={3} className={canvasTextareaClass} />

            <UnifiedCanvasSeparator label="Codebook" />
            <textarea value={codebookText} onChange={(e) => { form.setValue("codebookText", e.target.value); autoResizeElement(e.target, 80); }} placeholder="Add codebook details..." rows={3} className={canvasTextareaClass} />

            <UnifiedCanvasSeparator label="Sources" />
            <textarea value={sources} onChange={(e) => { form.setValue("sources", e.target.value); autoResizeElement(e.target, 80); }} placeholder="Add source information..." rows={3} className={cn(canvasTextareaClass, "border-b-0")} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[380px] border-l border-sidebar-border bg-sidebar overflow-y-auto">
          <LayerEditorSidebar
            form={form}
            fieldConfigs={fieldConfigs}
            geoJsonData={geoJsonData}
            onFileUpload={setGeoJsonData}
            currentLayerType={currentLayerType as "point" | "polygon"}
            configLayer={configLayer}
            mapSettings={mapSettings}
            onUpdateTile={handleUpdateTile}
            onUpdateZoom={handleUpdateZoom}
            onUpdateCenter={handleUpdateCenter}
            onUpdateLayerConfig={handleUpdateLayerConfig}
          />
        </div>
      </div>

      <ThumbnailDialog
        open={showThumbnailDialog}
        onOpenChange={setShowThumbnailDialog}
        capturedThumbnail={capturedThumbnail}
        layer={layer}
      />
    </div>
  );
}
