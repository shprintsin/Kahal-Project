"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
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
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@prisma/client";

interface TagInputProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag: (slug: string) => Promise<Tag>;
}

export function TagInput({ tags, selectedTagIds, onTagsChange, onCreateTag }: TagInputProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  const getTagName = (tag: Tag) => {
    if (typeof tag.nameI18n === "object" && tag.nameI18n !== null) {
      return (tag.nameI18n as Record<string, string>).en || (tag.nameI18n as Record<string, string>).he || Object.values(tag.nameI18n as Record<string, string>)[0] || tag.slug;
    }
    return tag.slug;
  };

  const availableTags = React.useMemo(() => {
    const unselected = tags.filter(tag => !selectedTagIds.includes(tag.id));
    if (!searchQuery.trim()) return unselected;
    const query = searchQuery.toLowerCase();
    return unselected.filter(tag =>
      tag.slug.toLowerCase().includes(query) ||
      getTagName(tag).toLowerCase().includes(query)
    );
  }, [tags, selectedTagIds, searchQuery]);

  const showCreateOption =
    searchQuery.trim() &&
    !tags.some(tag =>
      tag.slug.toLowerCase() === searchQuery.trim().toLowerCase() ||
      getTagName(tag).toLowerCase() === searchQuery.trim().toLowerCase()
    );

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreate = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newTag = await onCreateTag(searchQuery.trim());
      onTagsChange([...selectedTagIds, newTag.id]);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map(tag => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1 bg-white/10 text-white hover:bg-white/20 border-white/10">
              {getTagName(tag)}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                className="ml-1 rounded-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 text-sm font-normal"
          >
            <span className="text-muted-foreground">
              {selectedTags.length > 0
                ? `${selectedTags.length} tag${selectedTags.length > 1 ? "s" : ""} selected`
                : "Select tags..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create tags..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                No tags found.
              </CommandEmpty>
              {availableTags.length > 0 && (
                <CommandGroup>
                  {availableTags.slice(0, 10).map(tag => (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={() => toggleTag(tag.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTagIds.includes(tag.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {getTagName(tag)}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {showCreateOption && (
                <>
                  <div className="h-px bg-border my-1" />
                  <CommandGroup>
                    <CommandItem
                      onSelect={handleCreate}
                      disabled={isCreating}
                      className="text-blue-400 cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {isCreating ? "Creating..." : `Create "${searchQuery.trim()}"`}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
