"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  File,
  FileText,
  Image as ImageIcon,
  X,
  GripVertical,
  Edit3,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * FileUploadWidget - Drag and drop file upload with preview
 * Shows first 3 files, "Edit Resources" button opens management dialog
 */

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  file?: File;
}

interface FileUploadWidgetProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
}

export function FileUploadWidget({
  files,
  onFilesChange,
  accept = "*/*",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
}: FileUploadWidgetProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);
    const validFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds max size`);
        return;
      }

      // Check max files
      if (files.length + validFiles.length >= maxFiles) {
        console.warn("Max files reached");
        return;
      }

      validFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    });

    onFilesChange([...files, ...validFiles]);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const displayedFiles = files.slice(0, 3);
  const remainingCount = files.length - 3;

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Drop Zone */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-all cursor-pointer",
            "p-6 flex flex-col items-center justify-center gap-2",
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
          )}
        >
          <Upload className={cn("w-8 h-8", isDragging ? "text-blue-400" : "text-white/40")} />
          <div className="text-center">
            <p className="text-sm text-white/80">
              <span className="font-medium text-blue-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-white/40 mt-1">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            onChange={handleInputChange}
            className="hidden"
          />
        </div>

        {/* File Preview */}
        {files.length > 0 && (
          <div className="space-y-2">
            {displayedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10"
              >
                <span className="text-white/50">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate">{file.name}</p>
                  <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(file.id)}
                  className="h-7 w-7 text-white/50 hover:text-red-400 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* More files + Edit button */}
            <div className="flex items-center gap-2">
              {remainingCount > 0 && (
                <Badge variant="secondary" className="bg-white/10 text-white/60">
                  +{remainingCount} more
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDialog(true)}
                className="h-7 gap-1.5 text-white/60 hover:text-white hover:bg-white/10"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Resources
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Resources Management Dialog */}
      <ResourcesDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        files={files}
        onFilesChange={onFilesChange}
      />
    </>
  );
}

/**
 * ResourcesDialog - Dialog for managing uploaded files
 * Allows reordering and removing files
 */

interface ResourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

function ResourcesDialog({
  open,
  onOpenChange,
  files,
  onFilesChange,
}: ResourcesDialogProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newFiles = [...files];
      const [removed] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(dragOverIndex, 0, removed);
      onFilesChange(newFiles);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.includes("pdf")) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Manage Resources</DialogTitle>
          <DialogDescription className="text-white/60">
            Drag to reorder, click × to remove
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2">
          {files.length === 0 ? (
            <div className="py-8 text-center text-white/40 text-sm">
              No files uploaded yet
            </div>
          ) : (
            files.map((file, index) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move",
                  "bg-white/5 border-white/10",
                  draggedIndex === index && "opacity-50",
                  dragOverIndex === index && draggedIndex !== index && "border-blue-500"
                )}
              >
                {/* Drag Handle */}
                <GripVertical className="w-4 h-4 text-white/30 flex-shrink-0" />

                {/* File Icon */}
                <span className="text-white/50 flex-shrink-0">
                  {getFileIcon(file.type)}
                </span>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 truncate font-medium">{file.name}</p>
                  <p className="text-xs text-white/40">{formatFileSize(file.size)}</p>
                </div>

                {/* Order Badge */}
                <Badge variant="secondary" className="bg-white/10 text-white/50 text-xs">
                  #{index + 1}
                </Badge>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(file.id)}
                  className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-white/10 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
