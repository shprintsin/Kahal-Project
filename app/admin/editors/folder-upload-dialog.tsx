"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { uploadDocumentJson } from "@/app/admin/actions/documents";
import { JsonPageInput } from "@/types/document";
import { Upload, FileJson, Loader2 } from "lucide-react";

interface JsonUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  onSuccess?: (pages: any[]) => void;
}

export function JsonUploadDialog({
  open,
  onOpenChange,
  documentId,
  onSuccess,
}: JsonUploadDialogProps) {
  const [pages, setPages] = React.useState<JsonPageInput[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0]; // Only accept one JSON file

    if (!file.name.endsWith('.json')) {
        toast.error(`Skipping ${file.name}: Only .json files are allowed`);
        return;
    }

    try {
        const content = await file.text();
        const json = JSON.parse(content);
        
        let parsedPages: JsonPageInput[] = [];

        if (Array.isArray(json)) {
            parsedPages = json;
        } else if (typeof json === 'object' && json !== null) {
             // Handle single object or maybe object with specific key?
             // Assuming if single object it's a single page or the structure described by user
             parsedPages = [json];
        } else {
             toast.error("Invalid JSON structure");
             return;
        }

        if (parsedPages.length === 0) {
            toast.error("No pages found in JSON");
            return;
        }

        setPages(parsedPages);
        toast.success(`Loaded ${parsedPages.length} pages from JSON`);

    } catch (error) {
        toast.error(`Failed to parse ${file.name}`);
        console.error(error);
    }
  };

  const handleUpload = async () => {
    if (pages.length === 0) {
      toast.error("Please select a valid JSON file first");
      return;
    }

    setIsUploading(true);

    try {
      const result = await uploadDocumentJson(documentId, pages);

      if (result.success) {
        toast.success(`Successfully uploaded ${(result.data || []).length} pages`);
        onSuccess?.(result.data || []);
        setPages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onOpenChange(false);
      } else {
        toast.error(result.error || "Failed to upload pages");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload JSON</DialogTitle>
          <DialogDescription>
            Select a .json file containing the pages data.
            Expected structure: Array of objects with filename, page_number, content, en, he, pl.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* File Input */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="max-w-xs mx-auto"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Select a .json file
            </p>
          </div>

          {/* Preview */}
          {pages.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">
                Preview ({pages.length} pages)
              </h3>
              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {pages.slice(0, 50).map((page, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                          #{page.page_number ?? idx}
                        </span>
                        {page.filename && (
                             <span className="font-medium text-sm truncate">{page.filename}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-1">
                        PL: {(page.pl || page.content || "").substring(0, 30)}...
                        | EN: {(page.en || "").substring(0, 30)}...
                      </div>
                    </div>
                  </div>
                ))}
                {pages.length > 50 && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                        ... and {pages.length - 50} more
                    </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setPages([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={pages.length === 0 || isUploading}>
            {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isUploading ? "Uploading..." : "Upload JSON"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
