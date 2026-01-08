"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HierarchyNode, deleteEntity, updateEntity } from "@/app/admin/actions/collections";
import { toast } from "sonner";
import { useRouter } from "next/navigation";



export default function NodeActions({ node }: { node: HierarchyNode }) {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${node.name}"? This action cannot be undone.`)) {
        return;
    }

    try {
        await deleteEntity(node.type, node.id);
        toast.success("Deleted successfully");
        router.refresh();
    } catch (e) {
        toast.error("Failed to delete");
    }
  }

  async function handleUpdate(formData: FormData) {
      setLoading(true);
      const name = formData.get("name") as string;
      const slug = formData.get("slug") as string;
      try {
          await updateEntity(node.type, node.id, { name, slug });
          toast.success("Updated successfully");
          setEditOpen(false);
      } catch (e) {
          toast.error("Failed to update");
      } finally {
          setLoading(false);
      }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3 w-3" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit {node.type}</DialogTitle>
              </DialogHeader>
              <form action={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                       <Label>Name</Label>
                       <Input name="name" defaultValue={node.name} required />
                  </div>
                  {node.type !== "COLLECTION" && (
                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input name="slug" defaultValue={node.slug} required />
                    </div>
                  )}
                  <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={loading}>Save</Button>
                  </DialogFooter>
              </form>
          </DialogContent>
      </Dialog>
    </>
  );
}
