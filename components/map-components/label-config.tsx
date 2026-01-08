"use client";

import React, { useMemo } from 'react';
import type { LayerConfig, LabelConfig } from '../../app/admin/maps/types/config.types';
import { extractProperties, extractUniqueValues } from '../../app/admin/maps/utils/geoJSONParser';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

interface LabelConfigProps {
  layer: LayerConfig;
  onUpdate: (updates: Partial<LayerConfig>) => void;
}

const FONTS = [
  'Arial, sans-serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Franklin Gothic, sans-serif'
];

export function LabelConfigComponent({ layer, onUpdate }: LabelConfigProps) {
  const labels = layer.labels || {
    show: false,
    field: '',
    className: `${layer.type}_label`,
    position: 'center' as const,
    fontSize: 14,
    fontColor: '#000000',
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal' as const
  };

  const properties = useMemo(() => {
    return layer.data ? extractProperties(layer.data) : [];
  }, [layer.data]);

  const fieldValues = useMemo(() => {
    if (!layer.data || !labels.field) return [];
    return extractUniqueValues(layer.data, labels.field);
  }, [layer.data, labels.field]);

  const handleLabelChange = (updates: Partial<LabelConfig>) => {
    onUpdate({
      labels: { ...labels, ...updates }
    });
  };

  const toggleIncludeValue = (value: string) => {
    const currentList = labels.include_list || [];
    const newList = currentList.includes(value)
      ? currentList.filter(v => v !== value)
      : [...currentList, value];
    
    handleLabelChange({ include_list: newList });
  };

  const toggleExcludeValue = (value: string) => {
    const currentList = labels.exclude_list || [];
    const newList = currentList.includes(value)
      ? currentList.filter(v => v !== value)
      : [...currentList, value];
    
    handleLabelChange({ exclude_list: newList });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground">Labels</h4>
        <div className="flex items-center space-x-2">
           <Switch
            checked={labels.show}
            onCheckedChange={(checked) => handleLabelChange({ show: checked })}
          />
          <Label>Show Labels</Label>
        </div>
      </div>

      {labels.show && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Label Field */}
          <div className="space-y-2">
            <Label>Label Field</Label>
            <Select
              value={labels.field}
              onValueChange={(val) => handleLabelChange({ field: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field for labels" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(prop => (
                  <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Font Size */}
            <div className="space-y-2">
              <Label>Size (px)</Label>
              <Input
                type="number"
                min={8}
                max={72}
                value={labels.fontSize || 14}
                onChange={(e) => handleLabelChange({ fontSize: parseInt(e.target.value) })}
              />
            </div>

            {/* Font Color */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={labels.fontColor || '#000000'}
                  onChange={(e) => handleLabelChange({ fontColor: e.target.value })}
                  className="h-10 w-12 rounded cursor-pointer border border-input p-1"
                />
                <Input 
                  value={labels.fontColor || '#000000'} 
                  onChange={(e) => handleLabelChange({ fontColor: e.target.value })}
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={labels.fontFamily || 'Arial, sans-serif'}
              onValueChange={(val) => handleLabelChange({ fontFamily: val })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(font => (
                  <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                    {font.split(',')[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
             <Label>Font Weight</Label>
             <Select
              value={labels.fontWeight || 'normal'}
              onValueChange={(val) => handleLabelChange({ fontWeight: val as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Include/Exclude Lists - Different behavior for polygon vs point */}
          {labels.field && fieldValues.length > 0 && fieldValues.length <= 50 && (
            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              {layer.type === 'polygon' ? (
                // Polygons: Default is ALL labels shown, allow excluding specific ones
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Exclude Specific Labels</Label>
                    {labels.exclude_list && labels.exclude_list.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleLabelChange({ exclude_list: undefined })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {fieldValues.map(value => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`exclude-${value}`}
                          checked={labels.exclude_list?.includes(value) || false}
                          onCheckedChange={() => toggleExcludeValue(value)}
                        />
                        <label
                          htmlFor={`exclude-${value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Points: Default is NO labels shown, allow including specific ones
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Include Specific Labels</Label>
                    {labels.include_list && labels.include_list.length > 0 && (
                       <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleLabelChange({ include_list: undefined })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {fieldValues.map(value => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`include-${value}`}
                          checked={labels.include_list?.includes(value) || false}
                          onCheckedChange={() => toggleIncludeValue(value)}
                        />
                         <label
                          htmlFor={`include-${value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
