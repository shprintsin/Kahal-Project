"use client";

import React, { useMemo } from 'react';
import type { LayerConfig, PopupConfig } from '../../app/admin/maps/types/config.types';
import { extractProperties } from '../../app/admin/maps/utils/geoJSONParser';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

interface PopupConfigProps {
  layer: LayerConfig;
  onUpdate: (updates: Partial<LayerConfig>) => void;
}

export function PopupConfigComponent({ layer, onUpdate }: PopupConfigProps) {
  const popup = layer.popup || {
    show: false,
    type: 'list' as const,
    fields: [],
    template: ''
  };

  const properties = useMemo(() => {
    return layer.data ? extractProperties(layer.data) : [];
  }, [layer.data]);

  const handlePopupChange = (updates: Partial<PopupConfig>) => {
    onUpdate({
      popup: { ...popup, ...updates }
    });
  };

  const toggleField = (field: string) => {
    const currentFields = popup.fields || [];
    const newFields = currentFields.includes(field)
      ? currentFields.filter(f => f !== field)
      : [...currentFields, field];
    
    handlePopupChange({ fields: newFields });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm text-muted-foreground">Popup</h4>
        <div className="flex items-center space-x-2">
           <Switch
            checked={popup.show}
            onCheckedChange={(checked) => handlePopupChange({ show: checked })}
          />
          <Label>Enable Popup</Label>
        </div>
      </div>

      {popup.show && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* Popup Type */}
          <div className="space-y-2">
            <Label>Display Type</Label>
            <Select
              value={popup.type}
              onValueChange={(val) => handlePopupChange({ type: val as 'list' | 'template' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="list">Field List</SelectItem>
                <SelectItem value="template">Custom Template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List Configuration */}
          {popup.type === 'list' && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <Label className="text-xs font-semibold mb-2 block">Visible Fields</Label>
              <ScrollArea className="h-40 pr-3">
                <div className="space-y-2">
                  {properties.map(field => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={`popup-field-${field}`}
                        checked={popup.fields?.includes(field) || false}
                        onCheckedChange={() => toggleField(field)}
                      />
                      <label
                        htmlFor={`popup-field-${field}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer"
                      >
                        {field}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Template Configuration */}
          {popup.type === 'template' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Template String (HTML)</Label>
                <Textarea
                  placeholder="<b>{name}</b><br/>Value: {value}"
                  value={popup.template || ''}
                  onChange={(e) => handlePopupChange({ template: e.target.value })}
                  className="font-mono text-xs min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Use <code>{`{fieldName}`}</code> to insert data values. HTML is supported.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Available Fields:</Label>
                <div className="flex flex-wrap gap-1">
                  {properties.map(prop => (
                    <span 
                      key={prop} 
                      className="text-[10px] px-1.5 py-0.5 bg-muted rounded border cursor-copy hover:bg-muted/80"
                      onClick={() => {
                        const newTemplate = (popup.template || '') + `{${prop}}`;
                        handlePopupChange({ template: newTemplate });
                      }}
                      title="Click to append to template"
                    >
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
