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
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderPages } from "@/app/admin/actions/collections";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getOptimizedImageUrl, ImagePresets } from "@/lib/image-utils";
import { Card, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSeparator
} from "@/components/ui/context-menu";
import { PlusCircle } from "lucide-react";
import SetThumbnailDialog from "./set-thumbnail-dialog";
import AddToArtifactDialog from "./add-to-artifact-dialog";

// Type definition matching the server response
type Page = {
    id: string;
    sequenceIndex: number;
    label: string | null;
    images: { storageFile: { id: string; publicUrl: string | null; mimeType: string | null } }[];
    texts: { type: string; content: string }[];
};

export default function ThumbnailGrid({ 
    initialPages, 
    volumeId,
    seriesId,
    collectionId
}: { 
    initialPages: Page[]; 
    volumeId: string;
    seriesId?: string;
    collectionId?: string;
}) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [thumbnailDialogState, setThumbnailDialogState] = useState<{open: boolean, fileId: string | null}>({open: false, fileId: null});
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Artifact Dialog State
  const [artifactDialogState, setArtifactDialogState] = useState<{open: boolean, pageIds: string[]}>({open: false, pageIds: []});

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

  const toggleSelection = (id: string, multi: boolean) => {
      const newSelected = new Set(multi ? selectedIds : []);
      if (newSelected.has(id)) {
          newSelected.delete(id);
      } else {
          newSelected.add(id);
      }
      setSelectedIds(newSelected);
  };

  const handleContextMenuOpen = (id: string) => {
      // If the item clicked is not in selection, select ONLY it (unless ctrl held? Cant detect easily here).
      // Standard: if clicked item NOT in selection, selection = [clicked].
      // If clicked item IN selection, keep selection.
      if (!selectedIds.has(id)) {
          setSelectedIds(new Set([id]));
      }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      
      const newOrder = arrayMove(pages, pages.findIndex((i) => i.id === active.id), pages.findIndex((i) => i.id === over?.id)).map(p => p.id);
      try {
          await reorderPages(volumeId, newOrder);
          toast.success("Order updated");
      } catch (e) {
          toast.error("Failed to update order");
      }
    }
  };

  return (
    <>
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border">
          <div className="text-sm text-muted-foreground">
              {selectedIds.size} Selected
          </div>
          <div className="flex gap-2">
               {selectedIds.size > 0 && (
                   <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="text-xs text-primary hover:underline"
                   >
                       Clear Selection
                   </button>
               )}
          </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {pages.map((page) => (
                <ContextMenu key={page.id} onOpenChange={(open) => { if(open) handleContextMenuOpen(page.id); }}>
                    <ContextMenuTrigger>
                        <SortableItem 
                            page={page} 
                            selected={selectedIds.has(page.id)}
                            onSelect={(multi) => toggleSelection(page.id, multi)}
                        />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem 
                          onClick={() => {
                              const fileId = page.images[0]?.storageFile?.id;
                              if (fileId) {
                                  setThumbnailDialogState({ open: true, fileId });
                              } else {
                                  toast.error("No image available for this page");
                              }
                          }}
                        >
                            Set as Thumbnail
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuSub>
                            <ContextMenuSubTrigger>
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Add to Artifact
                            </ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <ContextMenuItem onClick={() => setArtifactDialogState({ open: true, pageIds: Array.from(selectedIds) })}>
                                    Existing or New...
                                </ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                    </ContextMenuContent>
                </ContextMenu>
              ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>

    {thumbnailDialogState.fileId && (
        <SetThumbnailDialog 
            open={thumbnailDialogState.open} 
            onOpenChange={(open) => setThumbnailDialogState(prev => ({ ...prev, open }))}
            storageFileId={thumbnailDialogState.fileId}
            volumeId={volumeId}
            seriesId={seriesId}
            collectionId={collectionId}
        />
    )}

    <AddToArtifactDialog 
        open={artifactDialogState.open}
        onOpenChange={(open) => setArtifactDialogState(prev => ({ ...prev, open }))}
        pageIds={artifactDialogState.pageIds}
        onSuccess={() => {
            setSelectedIds(new Set()); // Clear selection on success
        }}
    />
    </>
  );
}

function SortableItem({ page, selected, onSelect }: { page: Page, selected: boolean, onSelect: (multi: boolean) => void }) {
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
  const thumbnail = thumbnailOriginal ? getOptimizedImageUrl(thumbnailOriginal, ImagePresets.thumbnail) : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing overflow-hidden transition-all",
        isDragging && "opacity-50 ring-2 ring-primary",
        selected ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-primary/50"
      )}
      onClick={(e) => {
          if (e.ctrlKey || e.shiftKey) {
              e.preventDefault();
              onSelect(true);
          }
      }}
      {...attributes}
      {...listeners}
    >
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity aria-selected:opacity-100" aria-selected={selected}>
             <Checkbox 
                checked={selected}
                onCheckedChange={() => onSelect(true)} 
                className="bg-background/80 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()} // Prevent card click
             />
        </div>

        <div className="relative aspect-3/4 bg-muted">
            {thumbnail ? (
                 <Image src={thumbnail} alt={`Page ${page.sequenceIndex}`} fill className="object-cover" unoptimized />
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    No Image
                </div>
            )}
            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                #{page.sequenceIndex}
            </div>
        </div>
        <CardFooter className="p-2 text-xs text-muted-foreground justify-center border-t bg-muted/20">
            <span className="truncate w-full text-center">
                {page.label || `Page ${page.sequenceIndex}`}
            </span>
        </CardFooter>
    </Card>
  );
}
