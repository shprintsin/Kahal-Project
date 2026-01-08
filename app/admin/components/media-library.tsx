"use client";

import * as React from "react";
import { Media } from "@prisma/client";
import { Button } from "@/components/ui/button";

// type Media = Database["public"]["Tables"]["media"]["Row"];
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { uploadMediaFile, deleteMedia } from "../actions/media";
import { Upload, Loader2, Trash, FileText, Image as ImageIcon, Map, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDateHe } from "@/app/admin/utils/date";


interface MediaLibraryProps {
  media: Media[];
}

export function MediaLibrary({ media }: MediaLibraryProps) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState<"all" | "images" | "pdfs" | "geojson" | "data">("all");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadMediaFile(file);
      }
      toast.success(`${files.length} file(s) uploaded successfully!`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload files");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      await deleteMedia(id);
      toast.success("File deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFileType = (url: string): "image" | "pdf" | "geojson" | "data" | "other" => {
    if (url.includes("/thumbnail/")) return "image";
    if (url.includes("/pdfs/")) return "pdf";
    if (url.includes("/geojson/")) return "geojson";
    if (url.includes("/data/")) return "data";
    return "other";
  };

  const filteredMedia = media.filter((item) => {
    if (selectedTab === "all") return true;
    const type = getFileType(item.url);
    return type === selectedTab.replace("s", "") as any;
  });

  const counts = {
    all: media.length,
    images: media.filter((m) => getFileType(m.url) === "image").length,
    pdfs: media.filter((m) => getFileType(m.url) === "pdf").length,
    geojson: media.filter((m) => getFileType(m.url) === "geojson").length,
    data: media.filter((m) => getFileType(m.url) === "data").length,
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Input
              id="file-upload"
              type="file"
              multiple
              accept="image/*,.pdf,.geojson,.csv,.xlsx,.xls,.json,application/geo+json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">
                {uploading ? "Uploading..." : "Click to upload files"}
              </p>
              <p className="text-sm text-muted-foreground">
                Images, PDFs, GeoJSON, CSV, XLSX, or JSON files
              </p>
              {uploading && (
                <Loader2 className="w-6 h-6 mx-auto mt-4 animate-spin text-primary" />
              )}
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="gap-2">
            All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImageIcon className="w-4 h-4" />
            Images ({counts.images})
          </TabsTrigger>
          <TabsTrigger value="pdfs" className="gap-2">
            <FileText className="w-4 h-4" />
            PDFs ({counts.pdfs})
          </TabsTrigger>
          <TabsTrigger value="geojson" className="gap-2">
            <Map className="w-4 h-4" />
            GeoJSON ({counts.geojson})
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <FileText className="w-4 h-4" />
            Data ({counts.data})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredMedia.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No files found. Upload some files to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                const type = getFileType(item.url);
                return (
                  <Card key={item.id} className="overflow-hidden group">
                    <CardContent className="p-0">
                      {/* Preview */}
                      <div className="aspect-square bg-muted relative flex items-center justify-center">
                        {type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : type === "pdf" ? (
                          <FileText className="w-16 h-16 text-red-500" />
                        ) : type === "geojson" ? (
                          <Map className="w-16 h-16 text-green-500" />
                        ) : type === "data" ? (
                          <FileText className="w-16 h-16 text-blue-500" />
                        ) : (
                          <FileText className="w-16 h-16 text-gray-500" />
                        )}
                        
                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => copyToClipboard(item.url, item.id)}
                          >
                            {copiedId === item.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                         )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id, item.filename)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-sm font-medium truncate" title={item.filename}>
                          {item.filename}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {type.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {formatDateHe(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
