"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { Category } from "@/app/admin/types";
import { toast } from "sonner";

// type Category = Database["public"]["Tables"]["categories"]["Row"];
import { Language } from "@/app/admin/types";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  language: Language;
  onCategoryChange: (categoryId: string | null) => void;
  onCreateCategory: (name: string, language: Language) => Promise<Category>;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  language,
  onCategoryChange,
  onCreateCategory,
}: CategorySelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const getCategoryName = (category: Category) => {
    const nameMap = category.titleI18n as any;
    if (typeof nameMap === "object" && nameMap !== null) {
      return nameMap[language] || nameMap.en || category.title;
    }
    return category.title || category.slug;
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsCreating(true);
    try {
      const newCategory = await onCreateCategory(newCategoryName, language);
      onCategoryChange(newCategory.id);
      setIsDialogOpen(false);
      setNewCategoryName("");
      toast.success("Category created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex gap-2">
          <Select value={selectedCategoryId || "none"} onValueChange={(value) => onCategoryChange(value === "none" ? null : value)}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {getCategoryName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            title="Add new category"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Create Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">
                Category Name ({language})
              </Label>
              <Input
                id="category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                The category will be created for the current post language ({language})
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNewCategoryName("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={isCreating || !newCategoryName.trim()}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
