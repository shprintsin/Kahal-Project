"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { setEntityThumbnail } from "@/app/admin/actions/collections";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface SetThumbnailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storageFileId: string;
  volumeId: string;
  seriesId?: string;
  collectionId?: string;
}

export default function SetThumbnailDialog({ 
    open, 
    onOpenChange, 
    storageFileId,
    volumeId,
    seriesId,
    collectionId
}: SetThumbnailDialogProps) {
  const [targets, setTargets] = useState({
    volume: true,
    series: false,
    collection: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const promises = [];
      if (targets.volume && volumeId) {
        promises.push(setEntityThumbnail("VOLUME", volumeId, storageFileId));
      }
      if (targets.series && seriesId) {
        promises.push(setEntityThumbnail("SERIES", seriesId, storageFileId));
      }
      if (targets.collection && collectionId) {
        promises.push(setEntityThumbnail("COLLECTION", collectionId, storageFileId));
      }

      await Promise.all(promises);
      toast.success("Thumbnail updated");
      onOpenChange(false);
    } catch (error) {
       toast.error("Failed to set thumbnail");
    } finally {
      setLoading(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
               <DialogHeader>
                   <DialogTitle>Set Thumbnail</DialogTitle>
               </DialogHeader>
               
               <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                       <Checkbox 
                            id="volume" 
                            checked={targets.volume} 
                            onCheckedChange={(c) => setTargets(prev => ({ ...prev, volume: !!c }))} 
                       />
                       <Label htmlFor="volume">Volume Thumbnail</Label>
                  </div>

                  {/* Only show Series/Collection options if IDs are available, or assume they are always relevant in this context?
                      The prompt implies we should show them.
                   */}
                   <div className="flex items-center space-x-2">
                       <Checkbox 
                            id="series" 
                            checked={targets.series} 
                            onCheckedChange={(c) => setTargets(prev => ({ ...prev, series: !!c }))} 
                       />
                       <Label htmlFor="series">Series Thumbnail</Label>
                  </div>

                   <div className="flex items-center space-x-2">
                       <Checkbox 
                            id="collection" 
                            checked={targets.collection} 
                            onCheckedChange={(c) => setTargets(prev => ({ ...prev, collection: !!c }))} 
                       />
                       <Label htmlFor="collection">Collection Thumbnail</Label>
                  </div>
               </div>

               <DialogFooter>
                   <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                   <Button onClick={handleSave} disabled={loading}>
                       {loading ? "Saving..." : "Save"}
                   </Button>
               </DialogFooter>
          </DialogContent>
      </Dialog>
  );
}
