"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderPages } from "@/app/admin/actions/collections";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl, ImagePresets } from "@/lib/image-utils";

// Type definition matching the server response
type Page = {
    id: string;
    sequenceIndex: number;
    label: string | null;
    images: { storageFile: { publicUrl: string | null; mimeType: string | null } }[];
    texts: { type: string; content: string; language?: string }[];
};

export default function PageList({ initialPages, volumeId }: { initialPages: Page[]; volumeId: string }) {
  const [pages, setPages] = useState(initialPages);
  const [isOrdering, setIsOrdering] = useState(false);

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Trigger server update
        setIsOrdering(true);
        reorderPages(volumeId, newItems.map(p => p.id))
            .then(() => toast.success("Order updated"))
            .catch(() => toast.error("Failed to update order"))
            .finally(() => setIsOrdering(false));

        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={pages} strategy={verticalListSortingStrategy}>
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[80px]">Seq</TableHead>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Preview (First 45 chars)</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <SortableRow key={page.id} page={page} />
            ))}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}





function SortableRow({ page }: { page: Page }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const thumbnailOriginal = page.images.find(i => i.storageFile.mimeType?.startsWith("image/"))?.storageFile.publicUrl;
  // Use optimized thumbnail URL
  const thumbnail = thumbnailOriginal ? getOptimizedImageUrl(thumbnailOriginal, ImagePresets.thumbnail) : null;
  
  // Find translations
  const texts = page.texts || [];
  // Assuming content is stored in PageText with implicit language assumption or just list them all?
  // Request said: "md content (only 45 letters)... english translaton, polish translation, heabrew translation"
  // Schema has `PageText` with `type` and `language`.
  // Let's just join them for now or list 3 columns? Use a single preview column for simplicity to fit in table.
  const previewText = texts.map(t => `[${t.language || '?'}] ${t.content.slice(0, 45)}...`).join(" | ");

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-50 bg-muted/50")}
    >
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-grab hover:text-primary">
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      <TableCell>{page.sequenceIndex}</TableCell>
      <TableCell>
         {thumbnail ? (
             <div className="relative w-12 h-16 bg-muted">
                 <Image src={thumbnail} alt="Page thumbnail" fill className="object-cover rounded-sm" unoptimized />
             </div>
         ) : (
             <div className="w-12 h-16 bg-muted rounded-sm flex items-center justify-center text-xs text-muted-foreground">
                 No Img
             </div>
         )}
      </TableCell>
      <TableCell>{page.label || "-"}</TableCell>
      <TableCell>
          <div className="max-w-[400px] truncate text-xs text-muted-foreground" title={previewText}>
              {previewText || "No text content"}
          </div>
      </TableCell>
      <TableCell className="text-right">
          {/* Add Remove button later if needed */}
      </TableCell>
    </TableRow>
  );
}
