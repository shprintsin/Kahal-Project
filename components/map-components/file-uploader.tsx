"use client";

import React, { useCallback, useState } from 'react';
import { parseGeoJSON, isValidGeoJSON } from '../../app/admin/maps/utils/geoJSONParser';
import type { FeatureCollection } from 'geojson';
import { Loader2, UploadCloud, FileJson, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadResult {
  data: FeatureCollection;
  url: string;
  filename: string;
}

interface FileUploaderProps {
  onFileLoaded?: (result: FileUploadResult) => void;
  onUpload?: (data: any) => void; // Alias for onFileLoaded data part
  existingData?: any;
  layerType?: string;
  compact?: boolean;
}

export function FileUploader({ 
  onFileLoaded, 
  onUpload, 
  existingData,
  layerType,
  compact = false 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessingAndUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Read and Validate Locally
      const text = await file.text();
      let geoJSON: any;
      try {
        geoJSON = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file");
      }
      
      // Validate GeoJSON structure
      if (!isValidGeoJSON(geoJSON)) {
        throw new Error("Invalid GeoJSON format");
      }
      
      const featureCollection = parseGeoJSON(geoJSON);
      if (!featureCollection) {
        throw new Error("Could not parse GeoJSON");
      }

      toast.success("GeoJSON loaded successfully");
      
      // Support both callback naming conventions
      if (onFileLoaded) {
        onFileLoaded({
          data: featureCollection,
          url: '',
          filename: file.name
        });
      }
      
      if (onUpload) {
        onUpload(featureCollection);
      }
      
    } catch (err: any) {
      console.error("File processing error:", err);
      setError(err.message || "Failed to process file");
      toast.error(err.message || "Failed to process file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(f => 
      f.name.endsWith('.json') || 
      f.name.endsWith('.geojson') ||
      f.type === 'application/json' ||
      f.type === 'application/geo+json'
    );
    
    if (jsonFile) {
      handleFileProcessingAndUpload(jsonFile);
    } else {
      toast.error("Please drop a valid .geojson or .json file");
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcessingAndUpload(file);
    }
  }, []);

  const clearData = () => {
    if (onUpload) onUpload(null);
    if (onFileLoaded) onFileLoaded({ data: { type: "FeatureCollection", features: [] }, url: "", filename: "" });
  };

  // If we have data and compact mode, show a small card
  if (existingData && compact) {
     const featureCount = existingData.features?.length || 0;
     const type = existingData.type || "FeatureCollection";

     return (
        <div className="border border-white/10 rounded-md p-3 flex items-center justify-between bg-[#1a1a1a]">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/10 rounded overflow-hidden">
                    <FileJson className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                    <div className="font-medium text-sm text-white/80">GeoJSON Data Loaded</div>
                    <div className="text-xs text-white/50">
                        {featureCount} features • {type}
                    </div>
                </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearData} className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10">
                <X className="h-4 w-4" />
            </Button>
        </div>
     );
  }

  return (
    <div
      className={`w-full border-2 border-dashed rounded-lg transition-colors ${
        isDragging ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-primary/50'
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={`flex flex-col items-center justify-center text-center ${compact ? 'p-4 min-h-[100px]' : 'p-8 min-h-[150px]'} relative`}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-white/60">Processing...</p>
          </div>
        ) : (
          <>
            <UploadCloud className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} text-white/40 mb-3`} />
            <div className="text-sm font-medium mb-1 text-white/70">
              {compact ? 'Drag GeoJSON or click' : 'Drag & drop GeoJSON file here'}
            </div>
            {!compact && (
                <p className="text-xs text-white/50 mb-4">
                or click to browse
                </p>
            )}
            
            <input
              type="file"
              accept=".json,.geojson,application/json,application/geo+json"
              onChange={handleFileInput}
              className="hidden"
              id="geojson-file-input"
            />
            <Button asChild variant="secondary" size="sm" className={compact ? "mt-2 z-10 relative" : "z-10 relative"}>
              <label htmlFor="geojson-file-input" className="cursor-pointer">
                Select File
              </label>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
