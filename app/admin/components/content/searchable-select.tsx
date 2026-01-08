"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Plus, Search, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

/**
 * SearchableSelect - Dropdown with search and "Add New" functionality
 * Used for categories, tags, etc.
 */

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  onCreateNew?: (value: string) => Promise<void> | void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createText?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onValueChange,
  options,
  onCreateNew,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  createText = "Create",
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleCreate = async () => {
    if (!searchQuery.trim() || !onCreateNew) return;
    
    setIsCreating(true);
    try {
      await onCreateNew(searchQuery.trim());
      setSearchQuery("");
      setOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  const showCreateOption =
    onCreateNew &&
    searchQuery.trim() &&
    !options.some((opt) => opt.label.toLowerCase() === searchQuery.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-8 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white",
            !value && "text-white/40",
            className
          )}
        >
          {selectedOption?.label || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-[#252525] border-white/10">
        <Command className="bg-transparent" shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="text-white placeholder:text-white/40"
          />
          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm text-white/40">
              {emptyText}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    setSearchQuery("");
                  }}
                  className="text-white/80 hover:bg-white/10 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Create New Option */}
            {showCreateOption && (
              <>
                <div className="h-px bg-white/10 my-1" />
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={isCreating}
                    className="text-blue-400 hover:bg-white/10 cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isCreating ? "Creating..." : `${createText} "${searchQuery}"`}
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

/**
 * TagInput - Multi-select with search and inline tag creation
 */

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  onCreateTag?: (tag: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  onCreateTag,
  placeholder = "Add tags...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) return suggestions;
    const query = inputValue.toLowerCase();
    return suggestions.filter(
      (tag) =>
        tag.toLowerCase().includes(query) && !value.includes(tag)
    );
  }, [suggestions, inputValue, value]);

  const handleAddTag = async (tag: string) => {
    if (!tag.trim() || value.includes(tag)) return;

    if (onCreateTag && !suggestions.includes(tag)) {
      await onCreateTag(tag);
    }

    onChange([...value, tag]);
    setInputValue("");
    setOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    }
  };

  const showCreateOption =
    inputValue.trim() &&
    !suggestions.includes(inputValue.trim()) &&
    !value.includes(inputValue.trim());

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-white/10 text-white/80 hover:bg-white/15 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input with Suggestions */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              className={cn(
                "w-full h-8 pl-8 pr-3 text-sm",
                "bg-white/5 border border-white/10 rounded",
                "text-white placeholder:text-white/40",
                "focus:outline-none focus:ring-1 focus:ring-blue-500"
              )}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[200px] p-0 bg-[#252525] border-white/10"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command className="bg-transparent" shouldFilter={false}>
            <CommandList>
              {filteredSuggestions.length === 0 && !showCreateOption ? (
                <CommandEmpty className="py-6 text-center text-sm text-white/40">
                  No suggestions
                </CommandEmpty>
              ) : (
                <>
                  {filteredSuggestions.length > 0 && (
                    <CommandGroup heading="Suggestions" className="text-white/50">
                      {filteredSuggestions.map((tag) => (
                        <CommandItem
                          key={tag}
                          onSelect={() => handleAddTag(tag)}
                          className="text-white/80 hover:bg-white/10 cursor-pointer"
                        >
                          {tag}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {showCreateOption && (
                    <>
                      {filteredSuggestions.length > 0 && (
                        <div className="h-px bg-white/10 my-1" />
                      )}
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => handleAddTag(inputValue.trim())}
                          className="text-blue-400 hover:bg-white/10 cursor-pointer"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create "{inputValue.trim()}"
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
