"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, X } from "lucide-react";

/**
 * ThumbnailUpload - Single image upload with preview
 * 
 * Features:
 * - Drag and drop support
 * - Click to browse
 * - Image preview
 * - Change/Remove actions
 * - Dark theme styling
 */

interface ThumbnailUploadProps {
  value?: string | File | null;
  onChange?: (file: File | null) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  disabled?: boolean;
}

export function ThumbnailUpload({
  value,
  onChange,
  className,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  label = "Thumbnail",
  disabled = false,
}: ThumbnailUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Generate preview URL
  React.useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      setPreview(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file size
    if (maxSize && file.size > maxSize) {
      alert(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace("*", ".*"))) {
      alert("Invalid file type");
      return;
    }

    onChange?.(file);
  };

  const handleRemove = () => {
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-white/10 hover:border-white/20",
          disabled && "opacity-50 cursor-not-allowed",
          preview ? "aspect-video" : "aspect-video"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          // Preview Mode
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt="Thumbnail preview"
              className="w-full h-full object-cover rounded-lg"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleBrowse}
                disabled={disabled}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          // Empty State
          <button
            type="button"
            onClick={handleBrowse}
            disabled={disabled}
            className={cn(
              "w-full h-full flex flex-col items-center justify-center gap-3 p-6",
              "text-white/40 hover:text-white/60 transition-colors",
              !disabled && "cursor-pointer"
            )}
          >
            <ImageIcon className="w-12 h-12" />
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-white/30 mt-1">
                PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
      </div>
    </div>
  );
}
