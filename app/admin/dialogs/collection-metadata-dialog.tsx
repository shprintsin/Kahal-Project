"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HierarchyNode, updateEntity, getEntity } from "@/app/admin/actions/collections";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { TranslatableInput } from "@/components/translatable-input";
import { useRouter } from "next/navigation";

interface MetadataDialogProps {
  node: HierarchyNode;
}

export default function MetadataDialog({ node }: MetadataDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setLoading(true);
      getEntity(node.type, node.id)
        .then((res) => {
          setData(res || {});
        })
        .catch(() => toast.error("Failed to fetch details"))
        .finally(() => setLoading(false));
    }
  }, [open, node.type, node.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateEntity(node.type, node.id, data);
      toast.success("Saved successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {node.type}: {node.name}</DialogTitle>
          <DialogDescription>Edit the metadata for this item.</DialogDescription>
        </DialogHeader>

        {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
            <div className="space-y-6 py-4">
                {/* General Section */}
                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-1">General</h3>
                    <div className="space-y-2">
                            <Label>Name (Primary)</Label>
                            <Input 
                            value={data?.name || data?.title || ""} 
                            onChange={(e) => updateField(node.type === "VOLUME" ? "title" : "name", e.target.value)}
                            />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input 
                            value={data?.slug || ""} 
                            onChange={(e) => updateField("slug", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Name (Translated)</Label>
                        <TranslatableInput 
                            value={node.type === "VOLUME" ? (data?.titleI18n || {}) : (data?.nameI18n || {})}
                            onChange={(val) => updateField(node.type === "VOLUME" ? "titleI18n" : "nameI18n", val)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description (Translated)</Label>
                        <TranslatableInput 
                            value={data?.descriptionI18n || {}}
                            onChange={(val) => updateField("descriptionI18n", val)}
                            variant="textarea"
                        />
                    </div>
                </div>

                {/* Details Section */}
                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-1">Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Year Min</Label>
                            <Input type="number" value={data?.yearMin || ""} onChange={(e) => updateField("yearMin", parseInt(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Year Max</Label>
                            <Input type="number" value={data?.yearMax || ""} onChange={(e) => updateField("yearMax", parseInt(e.target.value))} />
                        </div>
                    </div>

                    {node.type !== "COLLECTION" && (
                        <div className="space-y-2">
                            <Label>Index Number</Label>
                            <Input type="number" value={data?.indexNumber || ""} onChange={(e) => updateField("indexNumber", parseInt(e.target.value))} />
                        </div>
                    )}

                    {node.type === "SERIES" && (
                        <div className="space-y-2">
                            <Label>Period</Label>
                            <Input value={data?.period || ""} onChange={(e) => updateField("period", e.target.value)} />
                        </div>
                    )}

                    {node.type === "VOLUME" && (
                        <div className="space-y-2">
                            <Label>Year</Label>
                            <Input type="number" value={data?.year || ""} onChange={(e) => updateField("year", parseInt(e.target.value))} />
                        </div>
                    )}
                </div>

                {/* Attribution Section */}
                <div className="space-y-4">
                    <h3 className="font-medium text-sm text-muted-foreground border-b pb-1">Attribution</h3>
                        <div className="space-y-2">
                        <Label>Reference Code</Label>
                        <Input value={data?.referenceCode || ""} onChange={(e) => updateField("referenceCode", e.target.value)} />
                    </div>
                    
                    {(node.type === "SERIES" || node.type === "VOLUME") && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Editor</Label>
                                    <Input value={data?.editor || ""} onChange={(e) => updateField("editor", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Author</Label>
                                    <Input value={data?.author || ""} onChange={(e) => updateField("author", e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>License</Label>
                                <Input value={data?.license || ""} onChange={(e) => updateField("license", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Sources</Label>
                                <Textarea value={data?.sources || ""} onChange={(e) => updateField("sources", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Source Link</Label>
                                <Input value={data?.sourceLink || ""} onChange={(e) => updateField("sourceLink", e.target.value)} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || saving}>{saving ? "Saving..." : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
