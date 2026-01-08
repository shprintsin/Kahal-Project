"use client";

import React from 'react';
import { Eye, EyeOff, Copy, Trash2, GripVertical } from 'lucide-react';
import type { LayerConfig } from '../../app/admin/maps/types/config.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileUploader } from './file-uploader'; // Updated import

interface LayerManagerProps {
  layers: LayerConfig[];
  onToggleVisibility: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string) => void;
  selectedLayerId?: string;
  onAddLayer: () => void;
  onFileLoaded: (result: { data: any; url: string; filename: string }) => void; // Updated signature
  uploaderAccordionValue: string[];
  onUploaderAccordionChange: (value: string[]) => void;
}

export function LayerManager({
  layers,
  onToggleVisibility,
  onRemove,
  onDuplicate,
  onSelect,
  selectedLayerId,
  onAddLayer,
  onFileLoaded,
  uploaderAccordionValue,
  onUploaderAccordionChange
}: LayerManagerProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Layers</h3>
      </div>

      {/* File Uploader */}
      <div className={cn("transition-all", uploaderAccordionValue.includes('uploader') ? 'block' : 'hidden')}>
          <FileUploader onFileLoaded={onFileLoaded} />
      </div>
      
      {/* Add Layer Button (if uploader hidden) */}
      {!uploaderAccordionValue.includes('uploader') && (
        <Button onClick={onAddLayer} variant="outline" className="w-full border-dashed">
            Add New Layer
        </Button>
      )}

      <div className="space-y-2">
        {layers.map((layer) => (
            <Card
              key={layer.id}
              className={cn(
                "p-3 cursor-pointer transition-all hover:bg-accent/50",
                selectedLayerId === layer.id ? "border-primary bg-accent/20" : "",
                !layer.visible && "opacity-60"
              )}
              onClick={() => onSelect(layer.id)}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{layer.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-sm bg-secondary text-secondary-foreground border">
                      {layer.type}
                    </span>
                    {layer.sourceType && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded-sm border",
                        layer.sourceType === 'database' 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      )}>
                        {layer.sourceType === 'database' ? '💾 DB' : '🔗 URL'}
                      </span>
                    )}
                  </div>
                  {layer.data && layer.data.features && (
                    <p className="text-xs text-muted-foreground">
                      {layer.data.features.length} features
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(layer.id);
                    }}
                    title="Duplicate layer"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (window.confirm(`Delete layer "${layer.name}"?`)) {
                        onRemove(layer.id);
                      }
                    }}
                    title="Delete layer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

          ))}
      </div>
    </div>
  );
}
