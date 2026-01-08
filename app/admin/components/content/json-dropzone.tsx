"use client";

import React, { useCallback, useState } from 'react';
import { Loader2, UploadCloud, FileJson, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface JsonDropzoneProps {
  onFileLoaded?: (data: any) => void;
  compact?: boolean;
  label?: string;
}

export function JsonDropzone({ 
  onFileLoaded, 
  compact = false,
  label
}: JsonDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileProcessing = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (e) {
        throw new Error("Invalid JSON file");
      }
      
      // Basic validation - check if array or object
      if (!json || (typeof json !== 'object' && !Array.isArray(json))) {
         throw new Error("Invalid format: Expected JSON object or array");
      }

      toast.success("JSON loaded successfully");
      
      if (onFileLoaded) {
        onFileLoaded(json);
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
      f.type === 'application/json'
    );
    
    if (jsonFile) {
      handleFileProcessing(jsonFile);
    } else {
      toast.error("Please drop a valid .json file");
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
      handleFileProcessing(file);
    }
  }, []);

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
              {label || (compact ? 'Drag JSON pages here' : 'Drag & drop JSON file here')}
            </div>
            {!compact && (
                <p className="text-xs text-white/50 mb-4">
                or click to browse
                </p>
            )}
            
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileInput}
              className="hidden"
              id="json-file-input"
            />
            <Button asChild variant="secondary" size="sm" className={compact ? "mt-2 z-10 relative" : "z-10 relative"}>
              <label htmlFor="json-file-input" className="cursor-pointer">
                Select File
              </label>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
