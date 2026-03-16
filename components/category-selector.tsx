"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, Language } from "@/app/admin/types";
import { toast } from "sonner";

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
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const getCategoryName = (category: Category) => {
    const nameMap = category.titleI18n as Record<string, string> | null;
    if (typeof nameMap === "object" && nameMap !== null) {
      return nameMap[language] || nameMap.en || category.title;
    }
    return category.title || category.slug;
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(cat =>
      getCategoryName(cat).toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query)
    );
  }, [categories, searchQuery, language]);

  const showCreateOption =
    searchQuery.trim() &&
    !categories.some(cat =>
      getCategoryName(cat).toLowerCase() === searchQuery.trim().toLowerCase()
    );

  const handleCreate = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newCategory = await onCreateCategory(searchQuery.trim(), language);
      onCategoryChange(newCategory.id);
      setSearchQuery("");
      setOpen(false);
      toast.success("Category created!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to create category";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 text-sm font-normal"
        >
          {selectedCategory ? getCategoryName(selectedCategory) : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or create category..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
              No categories found.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__none__"
                onSelect={() => {
                  onCategoryChange(null);
                  setOpen(false);
                  setSearchQuery("");
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !selectedCategoryId ? "opacity-100" : "opacity-0"
                  )}
                />
                No Category
              </CommandItem>
              {filteredCategories.map(category => (
                <CommandItem
                  key={category.id}
                  value={category.id}
                  onSelect={() => {
                    onCategoryChange(category.id === selectedCategoryId ? null : category.id);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategoryId === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getCategoryName(category)}
                </CommandItem>
              ))}
            </CommandGroup>
            {showCreateOption && (
              <>
                <div className="h-px bg-border my-1" />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={isCreating}
                    className="text-blue-400 cursor-pointer"
                  >
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isCreating ? "Creating..." : `Create "${searchQuery.trim()}" (${language})`}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
