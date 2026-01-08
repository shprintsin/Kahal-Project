"use client";

import React, { useMemo } from 'react';
import { extractProperties, extractUniqueValues } from '../../app/admin/maps/utils/geoJSONParser';
import { generateColorDict } from '../../app/admin/maps/utils/colorUtils';
import type { LayerConfig, PolygonStyleConfig } from '../../app/admin/maps/types/config.types';
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
 * PolygonConfig Component
 * 
 * Purpose: Provides a UI for configuring polygon layer styles.
 * This component is ONLY used for polygon layers and shows polygon-specific options.
 * 
 * Polygon-specific style properties:
 * - Fill color (default_color): The interior color of polygons
 * - Border color (color): The outline color of polygons
 * - Border weight (weight): Thickness of polygon borders in pixels
 * - Fill opacity: Transparency of polygon fill (0-1)
 * 
 * Note: Unlike point layers, polygons do NOT have a radius property.
 * Polygons are filled shapes defined by their geometry coordinates.
 */
interface PolygonConfigProps {
  layer: LayerConfig;
  onUpdate: (updates: Partial<LayerConfig>) => void;
}

export function PolygonConfig({ layer, onUpdate }: PolygonConfigProps) {
  // Cast to PolygonStyleConfig since we know this component is only used for polygon layers
  const style = layer.style as PolygonStyleConfig;
  
  // Extract property names from GeoJSON data for categorization dropdown
  // This allows users to color polygons based on data attributes (e.g., region name, year)
  const properties = useMemo(() => {
    return layer.data ? extractProperties(layer.data) : [];
  }, [layer.data]);

  // Extract unique values for the selected category field
  // Used to generate color pickers for each category value
  const categoryValues = useMemo(() => {
    if (!layer.data || !style.field) return [];
    return extractUniqueValues(layer.data, style.field);
  }, [layer.data, style.field]);

  const handleStyleChange = (updates: Partial<PolygonStyleConfig>) => {
    onUpdate({
      style: { ...style, ...updates }
    });
  };

  /**
   * Handles switching between simple (single color) and category-based (multi-color) styling
   * 
   * Simple mode: All polygons use the same fill color
   * Category mode: Polygons are colored based on a data field value
   *                (e.g., different colors for different regions)
   */
  const handleCategoryFieldChange = (field: string) => {
    if (!layer.data) return;
    
    // Switch back to simple mode (single color for all polygons)
    if (!field || field === 'none') {
      handleStyleChange({ type: 'simple', field: undefined, color_dict: undefined });
      return;
    }

    // Switch to category mode: Extract unique values and generate a color for each
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
    <div className="space-y-4">
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
              value={style.default_color || '#3388ff'}
              onChange={(e) => handleStyleChange({ default_color: e.target.value })}
              className="h-8 w-10 rounded cursor-pointer border border-input p-1"
            />
            <Input 
              value={style.default_color || '#3388ff'} 
              onChange={(e) => handleStyleChange({ default_color: e.target.value })}
              className="font-mono text-xs h-8"
            />
          </div>
        </div>
      )}

      {/* Border Color */}
      <div className="space-y-1.5">
        <Label className="text-xs">Border Color</Label>
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

      {/* Border Weight & Fill Opacity in one row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Weight</Label>
            <span className="text-xs text-muted-foreground">{style.weight}px</span>
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

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Opacity</Label>
            <span className="text-xs text-muted-foreground">{((style.opacity || 0.2) * 100).toFixed(0)}%</span>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={[style.opacity ?? 0.2]}
            onValueChange={(vals) => handleStyleChange({ opacity: vals[0] })}
            className="py-1"
          />
        </div>
      </div>
    </div>
  );
}
