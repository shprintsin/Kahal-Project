"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Tag } from "@prisma/client";

// type Tag = Database["public"]["Tables"]["tags"]["Row"];

interface TagInputProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag: (slug: string) => Promise<Tag>;
}

export function TagInput({ tags, selectedTagIds, onTagsChange, onCreateTag }: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.id));

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Show suggestions based on current input (up to last semicolon)
    const lastPart = value.split(";").pop()?.trim() || "";
    
    if (lastPart.length > 0) {
      const filtered = tags.filter(tag => 
        tag.slug.toLowerCase().includes(lastPart.toLowerCase()) &&
        !selectedTagIds.includes(tag.id)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ";") {
      e.preventDefault();
      await processInput();
    }
  };

  const handleInputBlur = async () => {
    // Small delay to allow suggestion click
    setTimeout(async () => {
      if (inputValue.trim()) {
        await processInput();
      }
      setShowSuggestions(false);
    }, 200);
  };

  const processInput = async () => {
    const parts = inputValue.split(";").map(p => p.trim()).filter(Boolean);
    const lastPart = parts[parts.length - 1];
    
    if (!lastPart) return;

    // Check if tag exists
    const existingTag = tags.find(tag => 
      tag.slug.toLowerCase() === lastPart.toLowerCase()
    );

    if (existingTag && !selectedTagIds.includes(existingTag.id)) {
      // Add existing tag
      onTagsChange([...selectedTagIds, existingTag.id]);
    } else if (!existingTag) {
      // Create new tag
      try {
        const newTag = await onCreateTag(lastPart);
        onTagsChange([...selectedTagIds, newTag.id]);
      } catch (error) {
        console.error("Failed to create tag:", error);
      }
    }

    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = (tag: Tag) => {
    onTagsChange([...selectedTagIds, tag.id]);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTagIds.filter(id => id !== tagId));
  };

  const getTagName = (tag: Tag) => {
    if (typeof tag.nameI18n === "object" && tag.nameI18n !== null) {
      return (tag.nameI18n as any).en || (tag.nameI18n as any).he || Object.values(tag.nameI18n as any)[0] || tag.slug;
    }
    return tag.slug;
  };

  return (
    <div className="space-y-2">
      {/* Selected Tags as Badges */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
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

      {/* Input with Auto-suggest */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder="Type tags separated by semicolon (;)"
          className="w-full"
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50 max-h-48 overflow-auto">
            {suggestions.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => selectSuggestion(tag)}
                className="w-full px-3 py-2 text-left hover:bg-accent transition-colors text-sm"
              >
                {getTagName(tag)}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Separate tags with semicolon (;). New tags will be created automatically.
      </p>
    </div>
  );
}
