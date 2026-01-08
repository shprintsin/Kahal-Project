"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Media } from "@/app/admin/types";

// We'll accept a simpler media interface to avoid complex dependency chains
interface SimpleMedia {
  id: string;
  url: string;
  filename: string;
}

interface FeaturedImageProps {
  mediaId: string | null;
  mediaList: SimpleMedia[];
  onSelect: (mediaId: string | null) => void;
  onUpload: (file: File) => Promise<SimpleMedia>;
  uploading: boolean;
}

export function FeaturedImage({
  mediaId,
  mediaList,
  onSelect,
  onUpload,
  uploading,
}: FeaturedImageProps) {
  const [showDialog, setShowDialog] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    try {
      const newMedia = await onUpload(file);
      onSelect(newMedia.id);
      setShowDialog(false);
    } catch (error) {
      // Error is handled by parent or toast inside onUpload normally, but we catch here to be safe
      console.error(error);
    }
  };

  const selectedMedia = mediaList.find((m) => m.id === mediaId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Image</CardTitle>
        <CardDescription>Main thumbnail for your post</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mediaId && selectedMedia && (
          <div className="relative aspect-video rounded-lg overflow-hidden border group">
            <img
              src={selectedMedia.url}
              alt="Thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onSelect(null)}
              >
                Remove Image
              </Button>
            </div>
          </div>
        )}

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="w-full">
              <ImageIcon className="w-4 h-4 mr-2" />
              {mediaId ? "Change Image" : "Select Image"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Media Library</DialogTitle>
              <DialogDescription>
                Upload a new image or choose from your library
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-1">Click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, GIF up to 10MB
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </Label>
                {uploading && (
                  <div className="flex items-center justify-center mt-4">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Your Media ({mediaList.length})</h4>
                <div className="grid grid-cols-4 gap-4">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                        mediaId === item.id
                          ? "border-primary ring-2 ring-primary"
                          : "border-transparent hover:border-muted-foreground"
                      }`}
                      onClick={() => {
                        onSelect(item.id);
                        setShowDialog(false);
                      }}
                    >
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="w-full h-full object-cover"
                      />
                      {mediaId === item.id && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
