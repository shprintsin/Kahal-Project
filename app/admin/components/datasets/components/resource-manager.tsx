"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash, ExternalLink, FileText, Link as LinkIcon, Edit } from "lucide-react";
import { toast } from "sonner";
import { createDatasetResource, updateDatasetResource, deleteDatasetResource, uploadResourceFile } from "@/app/admin/actions/datasets";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { TranslatableInput } from "@/components/translatable-input";

// Define ResourceType enum manually to match Prisma
enum ResouceType {
    XLSX = "XLSX",
    CSV = "CSV",
    JSON = "JSON",
    PDF = "PDF",
    HTML = "HTML",
    DOCX = "DOCX",
    ZIP = "ZIP",
    TXT = "TXT",
    XLS = "XLS",
    PNG = "PNG",
    JPG = "JPG",
    TIFF = "TIFF",
    URL = "URL",
    UNKNOWN = "UNKNOWN"
}

interface ResourceManagerProps {
  datasetId: string | null;
  resources: any[];
}

export function ResourceManager({ datasetId, resources }: ResourceManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<any>(null);
  
  // Form state
  // excerptI18n is object
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    excerptI18n: {} as any, 
    url: "",
    filename: "",
    mimeType: "",
    format: ResouceType.UNKNOWN,
    isMainFile: false,
  });

  const [activeTab, setActiveTab] = React.useState("upload");
  const [uploading, setUploading] = React.useState(false);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      excerptI18n: {},
      url: "",
      filename: "",
      mimeType: "",
      format: ResouceType.UNKNOWN,
      isMainFile: false,
    });
    setEditingResource(null);
    setActiveTab("upload");
  };

  const handleOpenDialog = (resource?: any) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        slug: resource.slug,
        excerptI18n: resource.excerptI18n || resource.excerpt || {},
        url: resource.url,
        filename: resource.filename || "",
        mimeType: resource.mimeType || "",
        format: resource.format as ResouceType,
        isMainFile: resource.isMainFile,
      });
      setActiveTab(resource.format === "URL" ? "link" : "upload");
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const guessFormat = (filename: string, mime: string) => {
      const ext = filename.split('.').pop()?.toUpperCase();
      if (ext && Object.values(ResouceType).includes(ext as ResouceType)) {
          return ext as ResouceType;
      }
      if (mime) {
          if (mime.includes('pdf')) return ResouceType.PDF;
          if (mime.includes('json')) return ResouceType.JSON;
          if (mime.includes('csv')) return ResouceType.CSV;
          if (mime.includes('image/png')) return ResouceType.PNG;
          if (mime.includes('image/jpeg')) return ResouceType.JPG;
      }
      return ResouceType.UNKNOWN;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Create FormData and send to server action
      const formData = new FormData();
      formData.append('file', file);
      formData.append('datasetId', datasetId || '');
      
      const result = await uploadResourceFile(formData);

      setFormData(prev => ({
        ...prev,
        url: result.url,
        filename: result.filename,
        mimeType: result.mimeType,
        name: prev.name || result.name,
        slug: prev.slug || result.slug,
        format: result.format as ResouceType
      }));
      
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlBlur = () => {
      if (formData.format === ResouceType.URL && formData.url && !formData.name) {
          try {
              const urlObj = new URL(formData.url);
              const pathname = urlObj.pathname;
              const parts = pathname.split('/');
              const lastPart = parts[parts.length - 1];
              if (lastPart) {
                  const name = lastPart.split('.')[0];
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  const format = guessFormat(lastPart, "");
                  setFormData(prev => ({
                      ...prev,
                      name: prev.name || name,
                      slug: prev.slug || slug,
                      format: prev.format === ResouceType.URL ? (format !== ResouceType.UNKNOWN ? format : ResouceType.URL) : prev.format
                  }));
              }
          } catch (e) {
              // ignore invalid url
          }
      }
  }

  const  handleSave = async () => {
      setLoading(true);
      try {
          if (editingResource) {
              await updateDatasetResource(editingResource.id, formData);
              toast.success("Resource updated");
          } else {
              await createDatasetResource(datasetId, formData);
              toast.success("Resource added");
          }
          setDialogOpen(false);
          router.refresh();
      } catch (error) {
          toast.error("Failed to save resource");
          console.error(error);
      } finally {
          setLoading(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm("Are you sure?")) return;
      try {
          await deleteDatasetResource(id);
          toast.success("Resource deleted");
          router.refresh();
      } catch (error) {
          toast.error("Failed to delete resource");
      }
  };

  // Generate slug from name if empty
  React.useEffect(() => {
      if (formData.name && !formData.slug && !editingResource) {
          const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          setFormData(prev => ({ ...prev, slug }));
      }
  }, [formData.name]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Resources</h3>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Main</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No resources added yet.
                    </TableCell>
                </TableRow>
            ) : (
                resources.map((resource) => (
                <TableRow 
                    key={resource.id} 
                    onDoubleClick={() => handleOpenDialog(resource)}
                    className="cursor-pointer hover:bg-muted/50"
                >
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            {resource.format === 'URL' ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            <div>
                                <div>{resource.name}</div>
                                {resource.excerptI18n && (
                                    <div className="text-xs text-muted-foreground">
                                        {resource.excerptI18n.en || resource.excerptI18n.he || Object.values(resource.excerptI18n)[0] || ""}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell><span className="text-xs font-mono bg-muted px-2 py-1 rounded">{resource.format}</span></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{resource.slug}</TableCell>
                    <TableCell>
                        {resource.isMainFile && <div className="w-2 h-2 rounded-full bg-green-500" />}
                    </TableCell>
                    <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(resource);
                            }}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(resource.id);
                            }}
                        >
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" disabled={!!editingResource && formData.format === 'URL'}>Upload File</TabsTrigger>
              <TabsTrigger value="link" disabled={!!editingResource && formData.format !== 'URL'}>External Link</TabsTrigger>
            </TabsList>
            
            <div className="space-y-4 py-4">
                <TabsContent value="upload" className="space-y-4">
                    {!editingResource && (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                            <Label htmlFor="file-upload" className="cursor-pointer block">
                                {uploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <p>Uploading...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Plus className="w-8 h-8 mx-auto mb-2" />
                                        <p>Click to select file</p>
                                    </>
                                )}
                            </Label>
                            <Input 
                                id="file-upload" 
                                type="file" 
                                className="hidden" 
                                onChange={handleFileUpload} 
                                disabled={uploading}
                            />
                        </div>
                    )}
                    {formData.filename && (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {formData.filename}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="link" className="space-y-4">
                    <div className="space-y-2">
                        <Label>Resource URL</Label>
                        <Input 
                            value={formData.url} 
                            onChange={(e) => setFormData({...formData, url: e.target.value, format: ResouceType.URL})} 
                            onBlur={handleUrlBlur}
                            placeholder="https://example.com/data"
                        />
                    </div>
                </TabsContent>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input 
                            value={formData.slug} 
                            onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Excerpt (Translatable)</Label>
                    <TranslatableInput
                        value={formData.excerptI18n}
                        onChange={(val) => setFormData({...formData, excerptI18n: val})}
                        placeholder="Brief description..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox 
                        id="isMain" 
                        checked={formData.isMainFile} 
                        onCheckedChange={(c) => setFormData({...formData, isMainFile: !!c})}
                    />
                    <Label htmlFor="isMain">Is Main File?</Label>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={loading || uploading || !formData.url}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Resource
                </Button>
            </DialogFooter>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
