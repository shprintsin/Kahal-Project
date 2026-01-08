"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { createCollection, createSeries, createVolume } from "@/app/admin/actions/collections";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface CreateEntityDialogProps {
  type: "COLLECTION" | "SERIES" | "VOLUME";
  parentId: string | null;
  triggerVariant?: "default" | "icon" | "icon-small";
}

export default function CreateEntityDialog({
  type,
  parentId,
  triggerVariant = "default",
}: CreateEntityDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      if (type === "COLLECTION") {
        await createCollection(formData);
      } else if (type === "SERIES" && parentId) {
        await createSeries(parentId, formData);
      } else if (type === "VOLUME" && parentId) {
        await createVolume(parentId, formData);
      } else {
          throw new Error("Invalid operation");
      }
      
      toast.success(`${type} created successfully`);
      setOpen(false);
    } catch (error) {
      toast.error(`Failed to create ${type}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const title = type.charAt(0) + type.slice(1).toLowerCase();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button variant="ghost" size="icon" title={`Add ${title}`}>
            <Plus className="h-4 w-4" />
          </Button>
        ) : triggerVariant === "icon-small" ? (
           <Button variant="ghost" size="icon" className="h-6 w-6" title={`Add ${title}`}>
               <Plus className="h-3 w-3" />
           </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add {title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {title}</DialogTitle>
          <DialogDescription>
            Add a new {title.toLowerCase()} to the archive.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder={`e.g. ${type === 'VOLUME' ? 'Volume 1' : 'Main Collection'}`} />
          </div>
          
          {/* Collection doesn't usually have a manual slug in schema yet but we can request description */}
          {type === "COLLECTION" ? (
             <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" name="description" placeholder="Short description..." />
             </div>
          ) : (
            <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" required placeholder="e.g. vol-1" />
                <p className="text-[0.8rem] text-muted-foreground">URL-friendly identifier.</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
