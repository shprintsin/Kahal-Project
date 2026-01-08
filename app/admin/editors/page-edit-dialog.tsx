import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateDocumentPageInput } from "@/types/document";
import { useState, useEffect } from "react";

interface PageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: CreateDocumentPageInput;
  onSave: (updatedPage: CreateDocumentPageInput) => void;
}

export function PageEditDialog({
  open,
  onOpenChange,
  page,
  onSave,
}: PageEditDialogProps) {
  const [content, setContent] = useState(page.content);
  const [contentHe, setContentHe] = useState(page.contentHe || "");
  const [contentEn, setContentEn] = useState(page.contentEn || "");
  const [bookmark, setBookmark] = useState(page.bookmark || "");

  // Update local state when page prop changes
  useEffect(() => {
    setContent(page.content);
    setContentHe(page.contentHe || "");
    setContentEn(page.contentEn || "");
    setBookmark(page.bookmark || "");
  }, [page]);

  const handleSave = () => {
    onSave({
      ...page,
      content,
      contentHe: contentHe || undefined,
      contentEn: contentEn || undefined,
      bookmark: bookmark || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Page {page.index}</DialogTitle>
          <DialogDescription>
            Modify the content and bookmark for this page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 flex-1 min-h-0 flex flex-col">
          <div className="grid gap-2">
            <Label htmlFor="bookmark">Bookmark Label</Label>
            <Input
              id="bookmark"
              value={bookmark}
              onChange={(e) => setBookmark(e.target.value)}
              placeholder="e.g. Chapter 1"
            />
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
             <Label className="mb-2">Content</Label>
             <Tabs defaultValue="base" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="base">Base (PL)</TabsTrigger>
                <TabsTrigger value="he">Hebrew</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              
              <TabsContent value="base" className="flex-1 mt-2 min-h-0 flex flex-col">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="font-mono flex-1 resize-none"
                  placeholder="Polish / Base content..."
                />
              </TabsContent>
              
              <TabsContent value="he" className="flex-1 mt-2 min-h-0 flex flex-col">
                 <Textarea
                  value={contentHe}
                  onChange={(e) => setContentHe(e.target.value)}
                  className="font-mono flex-1 resize-none"
                  placeholder="Hebrew content..."
                  dir="rtl"
                />
              </TabsContent>
              
              <TabsContent value="en" className="flex-1 mt-2 min-h-0 flex flex-col">
                 <Textarea
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  className="font-mono flex-1 resize-none"
                  placeholder="English content..."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
