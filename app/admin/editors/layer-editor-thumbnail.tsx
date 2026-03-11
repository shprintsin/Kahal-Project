"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateLayer } from "@/app/admin/actions/layers";

interface ThumbnailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capturedThumbnail: string | null;
  layer?: any;
}

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/webp';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function ThumbnailDialog({ open, onOpenChange, capturedThumbnail, layer }: ThumbnailDialogProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleSelect() {
    if (!capturedThumbnail || !layer) return;

    try {
      setIsUploading(true);
      toast.loading("Uploading thumbnail...", { id: "upload-thumbnail" });

      const filename = `${layer.slug}-thumbnail-${Date.now()}.webp`;
      const file = dataURLtoFile(capturedThumbnail, filename);

      const { uploadMediaFile } = await import('@/app/admin/actions/media');
      const mediaRecord = await uploadMediaFile(file);

      await updateLayer(layer.id, { thumbnail: mediaRecord.url });

      toast.success("Thumbnail uploaded successfully!", { id: "upload-thumbnail" });
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      toast.error("Failed to upload thumbnail", { id: "upload-thumbnail" });
    } finally {
      setIsUploading(false);
    }
  }

  function handleDownload() {
    if (!capturedThumbnail) return;
    const link = document.createElement('a');
    link.href = capturedThumbnail;
    link.download = `${layer?.slug || 'layer'}-thumbnail.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Thumbnail downloaded!");
  }

  async function handleRemove() {
    if (!layer?.thumbnail) return;
    if (!confirm("Are you sure you want to remove the thumbnail?")) return;

    try {
      toast.loading("Removing thumbnail...", { id: "remove-thumbnail" });
      await updateLayer(layer.id, { thumbnail: null });
      toast.success("Thumbnail removed!", { id: "remove-thumbnail" });
      window.location.reload();
    } catch (error) {
      console.error("Error removing thumbnail:", error);
      toast.error("Failed to remove thumbnail", { id: "remove-thumbnail" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Layer Thumbnail</DialogTitle>
          <DialogDescription>
            {layer?.thumbnail && !capturedThumbnail
              ? "Current thumbnail is shown below. You can replace it with a new capture or remove it."
              : "Preview of the captured map thumbnail. Select it to upload to R2 storage."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {layer?.thumbnail && !capturedThumbnail && (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img src={layer.thumbnail} alt="Current layer thumbnail" className="w-full h-auto" />
              <div className="p-2 bg-gray-100 text-sm text-gray-600">Current Thumbnail</div>
            </div>
          )}

          {capturedThumbnail && (
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <img src={capturedThumbnail} alt="Captured thumbnail" className="w-full h-auto" />
              <div className="p-2 bg-emerald-100 text-sm text-emerald-800">New Capture</div>
            </div>
          )}

          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              {layer?.thumbnail && !capturedThumbnail && (
                <Button variant="destructive" onClick={handleRemove} disabled={isUploading}>
                  Remove Thumbnail
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                Close
              </Button>

              {capturedThumbnail && (
                <>
                  <Button variant="outline" onClick={handleDownload} disabled={isUploading} className="gap-2">
                    <Save className="h-4 w-4" />
                    Download
                  </Button>
                  {layer && (
                    <Button onClick={handleSelect} disabled={isUploading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isUploading ? "Uploading..." : "Select as Thumbnail"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
