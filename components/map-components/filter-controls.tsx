"use client";

import React, { useMemo } from 'react';
import type { LayerConfig, FilterConfig } from '../../app/admin/maps/types/config.types';
import { extractProperties, extractUniqueValues } from '../../app/admin/maps/utils/geoJSONParser';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilterControlsProps {
  layer: LayerConfig;
  onUpdate: (updates: Partial<LayerConfig>) => void;
}

export function FilterControls({ layer, onUpdate }: FilterControlsProps) {
  const filter = layer.filter || { field: undefined, exclude: [], include: [] };
  
  const properties = useMemo(() => {
    return layer.data ? extractProperties(layer.data) : [];
  }, [layer.data]);

  const fieldValues = useMemo(() => {
    if (!layer.data || !filter.field) return [];
    return extractUniqueValues(layer.data, filter.field);
  }, [layer.data, filter.field]);

  const handleFilterChange = (updates: Partial<FilterConfig>) => {
    // If we're changing the field, we should reset include/exclude
    if (updates.field !== undefined && updates.field !== filter.field) {
        updates.exclude = undefined;
        updates.include = undefined;
    }

    const newFilter = { ...filter, ...updates } as FilterConfig;
    
    // Remove filter object entirely if no field is selected
    if (!newFilter.field || newFilter.field === 'none') {
      onUpdate({ filter: undefined });
    } else {
      onUpdate({ filter: newFilter });
    }
  };

  const toggleExclude = (value: string) => {
    const currentList = filter.exclude || [];
    const newList = currentList.includes(value)
      ? currentList.filter(v => v !== value)
      : [...currentList, value];
    
    handleFilterChange({ exclude: newList.length > 0 ? newList : undefined });
  };

  const toggleInclude = (value: string) => {
    const currentList = filter.include || [];
    const newList = currentList.includes(value)
      ? currentList.filter(v => v !== value)
      : [...currentList, value];
    
    handleFilterChange({ include: newList.length > 0 ? newList : undefined });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Filter By Field</Label>
        <Select
          value={filter.field || 'none'}
          onValueChange={(val) => handleFilterChange({ field: val === 'none' ? undefined : val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select field..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No filter</SelectItem>
            {properties.map(prop => (
              <SelectItem key={prop} value={prop}>{prop}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filter.field && fieldValues.length > 0 && (
        <div className="space-y-4">
           {/* Limit displayed values if too many */}
           {fieldValues.length > 100 ? (
             <div className="text-sm text-muted-foreground p-2 border rounded bg-muted/20">
               Too many values to list ({fieldValues.length}). Please select a different field.
             </div>
           ) : (
             <>
               {/* Exclude List */}
               <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Exclude Values (Hide)</Label>
                    {filter.exclude && filter.exclude.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleFilterChange({ exclude: undefined })}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-40 pr-3">
                    <div className="space-y-2">
                      {fieldValues.map(value => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`exclude-${value}`}
                            checked={filter.exclude?.includes(value) || false}
                            onCheckedChange={() => toggleExclude(value)}
                          />
                          <label
                            htmlFor={`exclude-${value}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer"
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
               </div>

               {/* Include List */}
               <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Include Only (Show)</Label>
                    {filter.include && filter.include.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-xs text-primary hover:text-primary"
                        onClick={() => handleFilterChange({ include: undefined })}
                      >
                         Clear
                      </Button>
                    )}
                  </div>
                   <ScrollArea className="h-40 pr-3">
                    <div className="space-y-2">
                      {fieldValues.map(value => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`include-${value}`}
                            checked={filter.include?.includes(value) || false}
                            onCheckedChange={() => toggleInclude(value)}
                          />
                          <label
                            htmlFor={`include-${value}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate cursor-pointer"
                          >
                            {value}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
               </div>
             </>
           )}
        </div>
      )}
    </div>
  );
}
