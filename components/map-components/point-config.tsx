"use client";

import React, { useMemo } from 'react';
import { extractProperties, extractUniqueValues } from '../../app/admin/maps/utils/geoJSONParser';
import { generateColorDict } from '../../app/admin/maps/utils/colorUtils';
import type { LayerConfig, PointStyleConfig } from '../../app/admin/maps/types/config.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * PointConfig Component
 * 
 * Purpose: Provides a UI for configuring point/marker layer styles.
 * This component is ONLY used for point layers and shows point-specific options.
 * 
 * Point-specific style properties:
 * - Fill color (fillColor): The interior color of point markers
 * - Stroke color (color): The outline color of point markers
 * - Radius: The size of point markers in pixels (UNIQUE TO POINTS)
 * - Stroke weight (weight): Thickness of marker outlines in pixels
 * - Fill opacity: Transparency of marker fill (0-1)
 * 
 * Important: Unlike polygon layers, points REQUIRE a radius property to define their size.
 * Points are circular markers rendered at specific coordinates.
 * Polygons don't have radius because they're defined by their geometric boundaries.
 */
interface PointConfigProps {
  layer: LayerConfig;
  onUpdate: (updates: Partial<LayerConfig>) => void;
}

export function PointConfig({ layer, onUpdate }: PointConfigProps) {
  // Cast to PointStyleConfig since we know this component is only used for point layers
  const style = layer.style as PointStyleConfig;
  
  // Extract property names from GeoJSON data for categorization dropdown
  // This allows users to color points based on data attributes (e.g., city type, status)
  const properties = useMemo(() => {
    return layer.data ? extractProperties(layer.data) : [];
  }, [layer.data]);

  // Extract unique values for the selected category field
  // Used to generate color pickers for each category value
  const categoryValues = useMemo(() => {
    if (!layer.data || !style.field) return [];
    return extractUniqueValues(layer.data, style.field);
  }, [layer.data, style.field]);

  const handleStyleChange = (updates: Partial<PointStyleConfig>) => {
    onUpdate({
      style: { ...style, ...updates }
    });
  };

  const handleCategoryFieldChange = (field: string) => {
    if (!layer.data) return;
    
    // Handle switching back to simple mode
    if (!field || field === 'none') {
      handleStyleChange({ type: 'simple', field: undefined, color_dict: undefined });
      return;
    }

    const values = extractUniqueValues(layer.data, field);
    const colorDict = generateColorDict(values);
    
    handleStyleChange({
      type: 'category',
      field,
      color_dict: colorDict
    });
  };

  const handleColorChange = (category: string, color: string) => {
    handleStyleChange({
      color_dict: {
        ...style.color_dict,
        [category]: color
      }
    });
  };

  const handleAutoGenerateColors = () => {
    if (!categoryValues.length) return;
    const colorDict = generateColorDict(categoryValues);
    handleStyleChange({ color_dict: colorDict });
  };

  return (
    <div className="space-y-6">
      {/* Categorization */}
      <div className="space-y-1.5">
        <Label className="text-xs">Categorize By</Label>
        <Select
          value={style.type === 'category' && style.field ? style.field : 'none'}
          onValueChange={handleCategoryFieldChange}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Simple color)</SelectItem>
            {properties.map(prop => (
              <SelectItem key={prop} value={prop}>{prop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Colors */}
      {style.type === 'category' && style.field && categoryValues.length > 0 && (
        <div className="space-y-2 p-2 bg-muted/30 rounded">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Category Colors</Label>
            <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={handleAutoGenerateColors}>
              Auto
            </Button>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {categoryValues.map(value => (
              <div key={value} className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={style.color_dict?.[value] || '#cccccc'}
                  onChange={(e) => handleColorChange(value, e.target.value)}
                  className="h-5 w-5 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs truncate flex-1" title={value}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default/Simple Color */}
      {style.type === 'simple' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Fill Color</Label>
          <div className="flex gap-1.5">
            <input
              type="color"
              value={style.fillColor || '#3388ff'}
              onChange={(e) => handleStyleChange({ fillColor: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-input p-1"
            />
            <Input 
              value={style.fillColor || '#3388ff'} 
              onChange={(e) => handleStyleChange({ fillColor: e.target.value })}
              className="font-mono text-xs h-8"
            />
          </div>
        </div>
      )}

      {/* Stroke Color */}
      <div className="space-y-1.5">
        <Label className="text-xs">Stroke Color</Label>
        <div className="flex gap-1.5">
          <input
            type="color"
            value={style.color || '#3388ff'}
            onChange={(e) => handleStyleChange({ color: e.target.value })}
            className="h-8 w-10 rounded cursor-pointer border border-input p-1"
          />
          <Input 
            value={style.color || '#3388ff'} 
            onChange={(e) => handleStyleChange({ color: e.target.value })}
            className="font-mono text-xs h-8"
          />
        </div>
      </div>

      {/* Radius & Stroke Weight in one row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Radius</Label>
            <span className="text-xs text-muted-foreground">{style.radius || 10}px</span>
          </div>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[style.radius || 10]}
            onValueChange={(vals) => handleStyleChange({ radius: vals[0] })}
            className="py-1"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Weight</Label>
            <span className="text-xs text-muted-foreground">{style.weight || 1}px</span>
          </div>
          <Slider
            min={0}
            max={10}
            step={0.5}
            value={[style.weight || 1]}
            onValueChange={(vals) => handleStyleChange({ weight: vals[0] })}
            className="py-1"
          />
        </div>
      </div>

      {/* Fill Opacity */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label className="text-xs">Fill Opacity</Label>
          <span className="text-xs text-muted-foreground">{((style.fillOpacity || 0.8) * 100).toFixed(0)}%</span>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.05}
          value={[style.fillOpacity ?? 0.8]}
          onValueChange={(vals) => handleStyleChange({ fillOpacity: vals[0] })}
          className="py-1"
        />
      </div>
    </div>
  );
}
