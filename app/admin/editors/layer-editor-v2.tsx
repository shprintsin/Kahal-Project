"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { layerSchema, type LayerFormValues } from "@/app/admin/schema/layer";
import { createLayer, updateLayer, deleteLayer, listLayersAPI } from "@/app/admin/actions/layers";
import { FormFieldRenderer } from "@/app/admin/components/editors/form-field-renderer";
import { createLayerFieldConfigs } from "@/app/admin/layers/field-configs";
import { FileUploader } from "@/components/map-components/file-uploader";
import { MapPreview, type MapPreviewHandle } from "@/components/map-components/map-preview";
import { Trash2, Save, GripVertical, Camera, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UnifiedCanvasSeparator } from "@/app/admin/components/content/unified-canvas";
import { FileTree, type FileTreeItem } from "@/app/admin/components/content/file-tree";

// Config Components
import { MapSettings } from '@/components/map-components/map-settings';
import { PolygonConfig } from '@/components/map-components/polygon-config';
import { PointConfig } from '@/components/map-components/point-config';
import { LabelConfigComponent } from '@/components/map-components/label-config';
import { FilterControls } from '@/components/map-components/filter-controls';
import { PopupConfigComponent } from '@/components/map-components/popup-config';
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE } from "@/components/map-components/default-styles";
import { cn } from "@/lib/utils";

interface LayerEditorProps {
  layer?: any;
  mode: "create" | "edit";
}

export function LayerEditorV2({ layer, mode }: LayerEditorProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(layer?.geoJsonData || null);
  const [allLayers, setAllLayers] = useState<any[]>([]);
  
  // Thumbnail capture state
  const [capturedThumbnail, setCapturedThumbnail] = useState<string | null>(null);
  const [showThumbnailDialog, setShowThumbnailDialog] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const mapPreviewComponentRef = useRef<MapPreviewHandle>(null);

  const actualMode = mode || (layer ? "edit" : "create");

  // Load all layers for file tree
  useEffect(() => {
    listLayersAPI().then(result => setAllLayers(result.layers || []));
  }, []);

  // Build file tree from layers
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

  const handleFileSelect = (item: FileTreeItem) => {
    if (item.path) {
      router.push(`/admin${item.path}`);
    }
  };

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

  // Map Preview Settings
  const [mapSettings, setMapSettings] = useState(() => {
    const savedPreview = layer?.styleConfig?.previewSettings;
    
    if (savedPreview?.tile && savedPreview?.zoom && savedPreview?.center) {
      return savedPreview;
    }
    
    return {
      tile: {
        src: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        maxZoom: 18,
        subdomains: "abc",
        attribution: '© OpenStreetMap contributors'
      },
      zoom: 6,
      center: [52.0, 20.0] as [number, number],
    };
  });

  // Derived Preview Config
  const previewConfig = useMemo(() => {
    if (!geoJsonData) return null;

    const currentLayerType = (layerType === "POINTS" ? "point" : "polygon") as "point" | "polygon";
    const defaultStyle = currentLayerType === "point" ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE;

    return {
      ...mapSettings,
      layers: [
        {
          id: "preview",
          name: formName || "Preview",
          type: currentLayerType,
          data: geoJsonData,
          visible: true,
          style: styleConfig?.style || defaultStyle,
          labels: styleConfig?.labels,
          popup: styleConfig?.popup,
          filter: styleConfig?.filter,
          hover: styleConfig?.hover
        },
      ],
    };
  }, [mapSettings, geoJsonData, layerType, styleConfig, formName]);


  const handleFileUpload = (data: any) => {
    setGeoJsonData(data);
  };

  // Handlers for Map Preview Settings
  const handleUpdateTile = (tile: any) => setMapSettings((prev: any) => ({ ...prev, tile: { ...prev.tile, ...tile } }));
  const handleUpdateZoom = (zoom: number) => setMapSettings((prev: any) => ({ ...prev, zoom }));
  const handleUpdateCenter = (center: [number, number]) => setMapSettings((prev: any) => ({ ...prev, center }));

  // Handler for Layer Config updates
  const handleUpdateLayerConfig = (updates: any) => {
      const current = form.getValues("styleConfig") || {};
      const merged = { ...current, ...updates };
      form.setValue("styleConfig", merged, { shouldDirty: true, shouldValidate: true });
  };

  async function onSubmit(data: LayerFormValues) {
    setIsSubmitting(true);

    try {
      const submitData: any = {
        ...data,
        geoJsonData: geoJsonData,
        styleConfig: {
          ...data.styleConfig,
          previewSettings: mapSettings
        }
      };

      if (actualMode === "create") {
        toast.loading("Creating layer...", { id: "layer-save" });
        const result = await createLayer(submitData);

        if (result && result.id) {
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
    if (!layer) return;

    if (!confirm("Are you sure you want to delete this layer? This action cannot be undone.")) {
      return;
    }

    try {
      toast.loading("Deleting layer...", { id: "layer-delete" });
      await deleteLayer(layer.id);
      toast.success("Layer deleted successfully!", { id: "layer-delete" });
      router.push("/admin/layers");
    } catch (error: any) {
      console.error("Error deleting layer:", error);
      toast.error(error.message || "Failed to delete layer", { id: "layer-delete" });
    }
  }

  async function handleCaptureThumbnail() {
    if (!geoJsonData) {
      toast.error("Please upload GeoJSON data first");
      return;
    }

    const mapInstance = mapPreviewComponentRef.current?.getMapInstance();
    
    if (!mapInstance) {
      toast.error("Map not loaded yet. Please wait a moment and try again.");
      return;
    }

    try {
      toast.loading("Capturing thumbnail...", { id: "thumbnail-capture" });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const SimpleMapScreenshoter = (await import('leaflet-simple-map-screenshoter')).default;
      
      const screenshoter = new (SimpleMapScreenshoter as any)({
        hidden: true,
        preventDownload: true,
      });
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
      console.error("[Thumbnail] Error capturing thumbnail:", error);
      toast.error("Failed to capture thumbnail. Please try again.", { id: "thumbnail-capture" });
    }
  }

  function handleDownloadThumbnail() {
    if (!capturedThumbnail) return;

    const link = document.createElement('a');
    link.href = capturedThumbnail;
    link.download = `${layer?.slug || 'layer'}-thumbnail.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Thumbnail downloaded!");
  }

  function dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/webp';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  async function handleSelectThumbnail() {
    if (!capturedThumbnail || !layer) return;

    try {
      setIsUploadingThumbnail(true);
      toast.loading("Uploading thumbnail...", { id: "upload-thumbnail" });

      const filename = `${layer.slug}-thumbnail-${Date.now()}.webp`;
      const file = dataURLtoFile(capturedThumbnail, filename);

      const { uploadMediaFile } = await import('@/app/admin/actions/media');
      const mediaRecord = await uploadMediaFile(file);

      await updateLayer(layer.id, { thumbnail: mediaRecord.url });

      toast.success("Thumbnail uploaded successfully!", { id: "upload-thumbnail" });
      setShowThumbnailDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Failed to upload thumbnail", { id: "upload-thumbnail" });
    } finally {
      setIsUploadingThumbnail(false);
    }
  }

  async function handleRemoveThumbnail() {
    if (!layer?.thumbnail) return;

    if (!confirm("Are you sure you want to remove the thumbnail?")) {
      return;
    }

    try {
      toast.loading("Removing thumbnail...", { id: "remove-thumbnail" });
      await updateLayer(layer.id, { thumbnail: null });
      toast.success("Thumbnail removed!", { id: "remove-thumbnail" });
      window.location.reload();
    } catch (error) {
      console.error("Error removing thumbnail:", error);
      toast.error("Failed to remove thumbnail", { id: "remove-thumbnail" });
    }
  }

  const currentLayerType = layerType === "POINTS" ? "point" : "polygon";
  const configLayer = {
      id: "preview",
      name: formName || "Preview",
      type: currentLayerType as "point" | "polygon",
      data: geoJsonData,
      ...styleConfig,
      style: styleConfig?.style || (currentLayerType === "point" ? DEFAULT_POINT_STYLE : DEFAULT_POLYGON_STYLE)
  };

  // Auto-resize textarea helper
  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // Widget/Card component for sidebar
  const SidebarWidget = ({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar - Loop Style */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-sidebar-border px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1">
            {geoJsonData && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCaptureThumbnail}
                disabled={isSubmitting}
                className="h-8 gap-1.5"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Thumbnail</span>
              </Button>
            )}
            {actualMode === "edit" && layer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="h-8 text-destructive gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
              size="sm"
              className="h-8 gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Tree */}
        <div className="w-[280px] border-r border-white/5 bg-[#1e1e1e] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wide px-2">Layers</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/layers/new")}
              className="h-7 w-7 text-white/60 hover:text-white hover:bg-white/10"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FileTree
              items={fileTreeItems}
              currentFileId={layer?.id}
              onFileSelect={handleFileSelect}
              onFileCreate={() => router.push("/admin/layers/new")}
            />
          </div>
        </div>

        {/* Main Canvas Area with Unified Text Flow */}
        <div className="flex-1 bg-background overflow-y-auto">
          <div className="max-w-3xl mx-auto px-12 py-12">
            {/* Unified Canvas - All text flows as one */}
            <div className="space-y-0">
              {/* Title - Large Heading */}
              <input
                type="text"
                value={formName}
                onChange={(e) => form.setValue("name", e.target.value)}
                placeholder="Layer Title"
                className={cn(
                  "w-full bg-transparent border-none outline-none",
                  "text-4xl font-bold text-white",
                  "placeholder:text-white/20",
                  "py-2 focus:ring-0"
                )}
              />

              {/* Slug with prefix */}
              <div className="flex items-center py-2 border-b border-white/5">
                <span className="text-white/30 text-sm font-mono select-none">
                  /layers/
                </span>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => form.setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="layer-slug"
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none",
                    "text-sm font-mono text-white/60",
                    "placeholder:text-white/20",
                    "focus:ring-0"
                  )}
                />
              </div>

              {/* Map Preview - Comes right after slug */}
              <UnifiedCanvasSeparator label="Map Preview" />
              <div className="rounded-lg overflow-hidden border border-white/10 my-8" style={{ height: '600px' }}>
                {previewConfig ? (
                  <MapPreview ref={mapPreviewComponentRef} config={previewConfig} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <div className="p-4 bg-white/5 rounded-full mb-4">
                      <GripVertical className="w-6 h-6 opacity-50" />
                    </div>
                    <p>Upload GeoJSON data in the sidebar to see a preview</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <UnifiedCanvasSeparator label="Description" />
              <textarea
                value={formDescription}
                onChange={(e) => {
                  form.setValue("description", e.target.value);
                  autoResize(e.target);
                }}
                placeholder="Add a brief description of this layer..."
                rows={2}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none",
                  "text-lg text-white/70 leading-relaxed",
                  "placeholder:text-white/15",
                  "focus:ring-0 min-h-[60px] py-4",
                  "border-b border-white/5"
                )}
              />

              {/* Citation */}
              <UnifiedCanvasSeparator label="Citation" />
              <textarea
                value={citationText}
                onChange={(e) => {
                  form.setValue("citationText", e.target.value);
                  autoResize(e.target);
                }}
                placeholder="Add citation information..."
                rows={3}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none",
                  "text-base text-white/70 leading-[1.6]",
                  "placeholder:text-white/15",
                  "focus:ring-0 min-h-[80px] py-4",
                  "border-b border-white/5"
                )}
              />

              {/* Codebook */}
              <UnifiedCanvasSeparator label="Codebook" />
              <textarea
                value={codebookText}
                onChange={(e) => {
                  form.setValue("codebookText", e.target.value);
                  autoResize(e.target);
                }}
                placeholder="Add codebook details..."
                rows={3}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none",
                  "text-base text-white/70 leading-[1.6]",
                  "placeholder:text-white/15",
                  "focus:ring-0 min-h-[80px] py-4",
                  "border-b border-white/5"
                )}
              />

              {/* Sources */}
              <UnifiedCanvasSeparator label="Sources" />
              <textarea
                value={sources}
                onChange={(e) => {
                  form.setValue("sources", e.target.value);
                  autoResize(e.target);
                }}
                placeholder="Add source information..."
                rows={3}
                className={cn(
                  "w-full bg-transparent border-none outline-none resize-none",
                  "text-base text-white/70 leading-[1.6]",
                  "placeholder:text-white/15",
                  "focus:ring-0 min-h-[80px] py-4"
                )}
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Widgets */}
        <div className="w-[380px] border-l border-sidebar-border bg-sidebar overflow-y-auto">
          <Form {...form}>
            <div className="p-4 space-y-4">
              {/* GeoJSON Data Widget */}
              <SidebarWidget title="GeoJSON Data" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}>
                <FileUploader
                  onUpload={handleFileUpload}
                  existingData={geoJsonData}
                  layerType={currentLayerType}
                  compact={true}
                />
                {geoJsonData && (
                  <div className="mt-2 text-xs text-white/40 flex items-center">
                     <span className="w-2 h-2 rounded-full bg-green-500 mr-2"/>
                     {geoJsonData.features?.length || 0} features loaded
                  </div>
                )}
              </SidebarWidget>

              {/* Status & Type Widget */}
              <SidebarWidget title="Layer Info" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                <div className="space-y-3">
                  <FormFieldRenderer config={fieldConfigs.status} control={form.control as any} />
                  <FormFieldRenderer config={fieldConfigs.type} control={form.control as any} />
                  <FormFieldRenderer config={fieldConfigs.categoryId} control={form.control as any} />
                </div>
              </SidebarWidget>

              {/* Map Settings Widget */}
              <SidebarWidget title="Map Preview Settings" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}>
                <div className="[&_input]:bg-[#252525] [&_input]:border-white/10 [&_input]:text-white/80 [&_label]:text-white/60 [&_button]:text-white/70">
                  <MapSettings
                    config={{ tile: mapSettings.tile, zoom: mapSettings.zoom, center: mapSettings.center, layers: [] }}
                    onUpdateTile={handleUpdateTile}
                    onUpdateZoom={handleUpdateZoom}
                    onUpdateCenter={handleUpdateCenter}
                  />
                </div>
              </SidebarWidget>

              {/* Style Config Widget */}
              <SidebarWidget title="Layer Style" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}>
                <div className="[&_input]:bg-[#252525] [&_input]:border-white/10 [&_input]:text-white/80 [&_label]:text-white/60 [&_button]:text-white/70">
                  {currentLayerType === 'polygon' ? (
                    <PolygonConfig 
                      layer={configLayer as any} 
                      onUpdate={handleUpdateLayerConfig} 
                    />
                  ) : (
                    <PointConfig 
                      layer={configLayer as any} 
                      onUpdate={handleUpdateLayerConfig}
                    />
                  )}
                </div>
              </SidebarWidget>

              {/* Labels Widget */}
              <SidebarWidget title="Labels" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}>
                <div className="[&_input]:bg-[#252525] [&_input]:border-white/10 [&_input]:text-white/80 [&_label]:text-white/60 [&_select]:bg-[#252525] [&_select]:text-white/80">
                  <LabelConfigComponent 
                    layer={configLayer as any} 
                    onUpdate={handleUpdateLayerConfig} 
                  />
                </div>
              </SidebarWidget>

              {/* Popup Widget */}
              <SidebarWidget title="Popup Config" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}>
                <div className="[&_input]:bg-[#252525] [&_input]:border-white/10 [&_input]:text-white/80 [&_label]:text-white/60 [&_textarea]:bg-[#252525] [&_textarea]:border-white/10 [&_textarea]:text-white/80">
                  <PopupConfigComponent 
                    layer={configLayer as any} 
                    onUpdate={handleUpdateLayerConfig} 
                  />
                </div>
              </SidebarWidget>

              {/* Filter Widget */}
              <SidebarWidget title="Filters" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}>
                <div className="[&_input]:bg-[#252525] [&_input]:border-white/10 [&_input]:text-white/80 [&_label]:text-white/60 [&_select]:bg-[#252525] [&_select]:text-white/80">
                  <FilterControls 
                    layer={configLayer as any} 
                    onUpdate={handleUpdateLayerConfig} 
                  />
                </div>
              </SidebarWidget>

              {/* Data Details Widget */}
              <SidebarWidget title="Data Details" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}>
                <div className="space-y-3">
                  <FormFieldRenderer config={fieldConfigs.maturity} control={form.control as any} />
                  <div className="grid grid-cols-2 gap-2">
                    <FormFieldRenderer config={fieldConfigs.minYear} control={form.control as any} />
                    <FormFieldRenderer config={fieldConfigs.maxYear} control={form.control as any} />
                  </div>
                  <FormFieldRenderer config={fieldConfigs.license} control={form.control as any} />
                </div>
              </SidebarWidget>

              {/* Source Config Widget */}
              <SidebarWidget title="Source Configuration" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}>
                <div className="space-y-3">
                  <FormFieldRenderer config={fieldConfigs.sourceType} control={form.control as any} />
                  {form.watch("sourceType") === "url" && (
                    <FormFieldRenderer config={fieldConfigs.sourceUrl} control={form.control as any} />
                  )}
                  <FormFieldRenderer config={fieldConfigs.downloadUrl} control={form.control as any} />
                </div>
              </SidebarWidget>
            </div>
          </Form>
        </div>
      </div>

      {/* Thumbnail Preview Dialog */}
      <Dialog open={showThumbnailDialog} onOpenChange={setShowThumbnailDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Layer Thumbnail</DialogTitle>
            <DialogDescription>
              {layer?.thumbnail 
                ? "Current thumbnail is shown below. You can replace it with a new capture or remove it."
                : "Preview of the captured map thumbnail. Select it to upload to R2 storage."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {layer?.thumbnail && !capturedThumbnail && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img 
                  src={layer.thumbnail} 
                  alt="Current layer thumbnail" 
                  className="w-full h-auto"
                />
                <div className="p-2 bg-gray-100 text-sm text-gray-600">
                  Current Thumbnail
                </div>
              </div>
            )}
            
            {capturedThumbnail && (
              <div className="border rounded-lg overflow-hidden bg-gray-50">
                <img 
                  src={capturedThumbnail} 
                  alt="Captured thumbnail" 
                  className="w-full h-auto"
                />
                <div className="p-2 bg-emerald-100 text-sm text-emerald-800">
                  New Capture
                </div>
              </div>
            )}
            
            <div className="flex justify-between gap-2">
              <div className="flex gap-2">
                {layer?.thumbnail && !capturedThumbnail && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveThumbnail}
                    disabled={isUploadingThumbnail}
                  >
                    Remove Thumbnail
                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowThumbnailDialog(false)}
                  disabled={isUploadingThumbnail}
                >
                  Close
                </Button>
                
                {capturedThumbnail && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDownloadThumbnail}
                      disabled={isUploadingThumbnail}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Download
                    </Button>
                    
                    {layer && (
                      <Button
                        onClick={handleSelectThumbnail}
                        disabled={isUploadingThumbnail}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isUploadingThumbnail ? "Uploading..." : "Select as Thumbnail"}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
