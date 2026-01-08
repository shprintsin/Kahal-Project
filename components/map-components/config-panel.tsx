"use client";

import React, { useState } from 'react';

import { analyzeGeoJSON, calculateCenter } from '../../app/admin/maps/utils/geoJSONParser';
import { LayerManager } from './layer-manager';
import { PolygonConfig } from './polygon-config';
import { PointConfig } from './point-config';
import { LabelConfigComponent } from './label-config';
import { FilterControls } from './filter-controls';
import { MapSettings } from './map-settings';
import { PopupConfigComponent } from './popup-config';
import type { LayerConfig, MapConfig } from '../../app/admin/maps/types/config.types';
import { DEFAULT_POLYGON_STYLE, DEFAULT_POINT_STYLE, DEFAULT_LABEL_CONFIG } from './default-styles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface ConfigPanelProps {
  config: MapConfig;
  onUpdateTile: (tile: Partial<MapConfig['tile']>) => void;
  onUpdateZoom: (zoom: number) => void;
  onUpdateCenter: (center: [number, number]) => void;
  onAddLayer: (layer: Omit<LayerConfig, 'id'>) => string;
  onUpdateLayer: (id: string, updates: Partial<LayerConfig>) => void;
  onRemoveLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  // Removed Export props as they might be handled differently in admin panel or main editor
}

export function ConfigPanel({
  config,
  onUpdateTile,
  onUpdateZoom,
  onUpdateCenter,
  onAddLayer,
  onUpdateLayer,
  onRemoveLayer,
  onToggleLayerVisibility,
  onDuplicateLayer,
}: ConfigPanelProps) {
  const [selectedLayerId, setSelectedLayerId] = useState<string | undefined>();
  const [uploaderAccordionValue, setUploaderAccordionValue] = useState<string[]>([]);

  const selectedLayer = config.layers?.find(l => l.id === selectedLayerId);

  const handleFileLoaded = (result: { data: any; url: string; filename: string }) => {
    if (!result.data) {
      alert(`Error loading file.`);
      return;
    }

    const info = analyzeGeoJSON(result.data);
    if (!info) {
      alert('Could not analyze GeoJSON data');
      return;
    }

    const layerType = info.type === 'Point' || info.type === 'MultiPoint' ? 'point' : 'polygon';
    const layerName = result.filename.replace(/\.(geo)?json$/i, '');

    // Determine sourceType based on whether URL is provided
    const sourceType = result.url ? 'url' : 'database';

    const newLayer: Omit<LayerConfig, 'id'> = {
      name: layerName,
      type: layerType,
      sourceType: sourceType, // Add sourceType
      data: result.data, // Always include data for preview
      url: result.url || undefined, // Only set URL if provided
      visible: true,
      style: layerType === 'polygon' ? { ...DEFAULT_POLYGON_STYLE } : { ...DEFAULT_POINT_STYLE },
      labels: { ...DEFAULT_LABEL_CONFIG, className: `${layerType}_label` }
    };

    const newLayerId = onAddLayer(newLayer);
    setSelectedLayerId(newLayerId);
    
    // Auto-collapse the accordion after successful upload
    setUploaderAccordionValue([]);

    // Auto-center map on new layer
    const center = calculateCenter(result.data);
    if (center) {
        onUpdateCenter(center);
    }
  };

  return (
    <div className="absolute inset-0 bg-background overflow-y-auto">
      <div className="p-4 space-y-6">
          {/* Map Settings & Layer Manager */}
          
          <Card className="rounded-md border shadow-sm">
            <CardContent className="p-0">
               <div className="p-4 border-b">
                 <LayerManager
                    layers={config.layers || []}
                    onToggleVisibility={onToggleLayerVisibility}
                    onRemove={onRemoveLayer}
                    onDuplicate={onDuplicateLayer}
                    onSelect={setSelectedLayerId}
                    selectedLayerId={selectedLayerId}
                    onAddLayer={() => setUploaderAccordionValue(['uploader'])}
                    onFileLoaded={handleFileLoaded}
                    uploaderAccordionValue={uploaderAccordionValue}
                    onUploaderAccordionChange={setUploaderAccordionValue}
                />
               </div>
               
               <div className="p-4 bg-muted/10">
                  <MapSettings
                    config={config}
                    onUpdateTile={onUpdateTile}
                    onUpdateZoom={onUpdateZoom}
                    onUpdateCenter={onUpdateCenter}
                  />
               </div>
            </CardContent>
          </Card>

          {/* Layer Configuration */}
          {selectedLayer && (
            <Card className="animate-in slide-in-from-right-4 duration-300 border-primary/20 shadow-md">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <CardTitle className="text-base font-semibold truncate flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                  Configuring: {selectedLayer.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="multiple" defaultValue={['style']} className="w-full">
                  
                  {/* Style Configuration */}
                  <AccordionItem value="style">
                    <AccordionTrigger>Style</AccordionTrigger>
                    <AccordionContent className="pt-2">
                       {selectedLayer.type === 'polygon' ? (
                        <PolygonConfig 
                          layer={selectedLayer} 
                          onUpdate={(updates) => onUpdateLayer(selectedLayer.id, updates)} 
                        />
                      ) : (
                        <PointConfig 
                          layer={selectedLayer} 
                          onUpdate={(updates) => onUpdateLayer(selectedLayer.id, updates)} 
                        />
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Labels Configuration */}
                  <AccordionItem value="labels">
                    <AccordionTrigger>Labels</AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <LabelConfigComponent 
                        layer={selectedLayer} 
                        onUpdate={(updates) => onUpdateLayer(selectedLayer.id, updates)} 
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Filters Configuration */}
                  <AccordionItem value="filters">
                    <AccordionTrigger>Filters</AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <FilterControls 
                        layer={selectedLayer} 
                        onUpdate={(updates) => onUpdateLayer(selectedLayer.id, updates)} 
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Popup Configuration */}
                  <AccordionItem value="popup">
                    <AccordionTrigger>Popup</AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <PopupConfigComponent 
                        layer={selectedLayer} 
                        onUpdate={(updates) => onUpdateLayer(selectedLayer.id, updates)} 
                      />
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          )}
        </div>
    </div>
  );
}
