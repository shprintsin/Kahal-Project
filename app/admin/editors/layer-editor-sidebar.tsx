"use client";

import { AdminSidebarCard } from "@/app/admin/components/ui/admin-sidebar-card";
import { FormFieldRenderer } from "@/app/admin/components/editors/form-field-renderer";
import { FileUploader } from "@/components/map-components/file-uploader";
import { MapSettings } from '@/components/map-components/map-settings';
import { PolygonConfig } from '@/components/map-components/polygon-config';
import { PointConfig } from '@/components/map-components/point-config';
import { LabelConfigComponent } from '@/components/map-components/label-config';
import { FilterControls } from '@/components/map-components/filter-controls';
import { PopupConfigComponent } from '@/components/map-components/popup-config';
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface LayerEditorSidebarProps {
  form: UseFormReturn<any>;
  fieldConfigs: Record<string, any>;
  geoJsonData: any;
  onFileUpload: (data: any) => void;
  currentLayerType: "point" | "polygon";
  configLayer: any;
  mapSettings: any;
  onUpdateTile: (tile: any) => void;
  onUpdateZoom: (zoom: number) => void;
  onUpdateCenter: (center: [number, number]) => void;
  onUpdateLayerConfig: (updates: any) => void;
}

export function LayerEditorSidebar({
  form,
  fieldConfigs,
  geoJsonData,
  onFileUpload,
  currentLayerType,
  configLayer,
  mapSettings,
  onUpdateTile,
  onUpdateZoom,
  onUpdateCenter,
  onUpdateLayerConfig,
}: LayerEditorSidebarProps) {
  const darkOverride = "[&_input]:bg-[#252525] [&_input]:border-white/10 [&_input]:text-white/80 [&_label]:text-white/60 [&_button]:text-white/70";

  return (
    <Form {...form}>
      <div className="p-4 space-y-4">
        <AdminSidebarCard title="GeoJSON Data">
          <FileUploader
            onUpload={onFileUpload}
            existingData={geoJsonData}
            layerType={currentLayerType}
            compact={true}
          />
          {geoJsonData && (
            <div className="mt-2 text-xs text-white/40 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              {geoJsonData.features?.length || 0} features loaded
            </div>
          )}
        </AdminSidebarCard>

        <AdminSidebarCard title="Layer Info">
          <div className="space-y-3">
            <FormFieldRenderer config={fieldConfigs.status} control={form.control as any} />
            <FormFieldRenderer config={fieldConfigs.type} control={form.control as any} />
            <FormFieldRenderer config={fieldConfigs.categoryId} control={form.control as any} />
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Map Preview Settings">
          <div className={darkOverride}>
            <MapSettings
              config={{ tile: mapSettings.tile, zoom: mapSettings.zoom, center: mapSettings.center, layers: [] }}
              onUpdateTile={onUpdateTile}
              onUpdateZoom={onUpdateZoom}
              onUpdateCenter={onUpdateCenter}
            />
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Layer Style">
          <div className={darkOverride}>
            {currentLayerType === 'polygon' ? (
              <PolygonConfig layer={configLayer as any} onUpdate={onUpdateLayerConfig} />
            ) : (
              <PointConfig layer={configLayer as any} onUpdate={onUpdateLayerConfig} />
            )}
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Labels">
          <div className={`${darkOverride} [&_select]:bg-[#252525] [&_select]:text-white/80`}>
            <LabelConfigComponent layer={configLayer as any} onUpdate={onUpdateLayerConfig} />
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Popup Config">
          <div className={`${darkOverride} [&_textarea]:bg-[#252525] [&_textarea]:border-white/10 [&_textarea]:text-white/80`}>
            <PopupConfigComponent layer={configLayer as any} onUpdate={onUpdateLayerConfig} />
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Filters">
          <div className={`${darkOverride} [&_select]:bg-[#252525] [&_select]:text-white/80`}>
            <FilterControls layer={configLayer as any} onUpdate={onUpdateLayerConfig} />
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Data Details">
          <div className="space-y-3">
            <FormFieldRenderer config={fieldConfigs.maturity} control={form.control as any} />
            <div className="grid grid-cols-2 gap-2">
              <FormFieldRenderer config={fieldConfigs.minYear} control={form.control as any} />
              <FormFieldRenderer config={fieldConfigs.maxYear} control={form.control as any} />
            </div>
            <FormFieldRenderer config={fieldConfigs.license} control={form.control as any} />
          </div>
        </AdminSidebarCard>

        <AdminSidebarCard title="Source Configuration">
          <div className="space-y-3">
            <FormFieldRenderer config={fieldConfigs.sourceType} control={form.control as any} />
            {form.watch("sourceType") === "url" && (
              <FormFieldRenderer config={fieldConfigs.sourceUrl} control={form.control as any} />
            )}
            <FormFieldRenderer config={fieldConfigs.downloadUrl} control={form.control as any} />
          </div>
        </AdminSidebarCard>
      </div>
    </Form>
  );
}
