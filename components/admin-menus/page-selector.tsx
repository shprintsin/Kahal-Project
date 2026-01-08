"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPages } from "@/app/admin/actions/pages";

interface Page {
  id: string;
  title: string | Record<string, string>;
  slug: string;
  status: string;
}

interface PageSelectorProps {
  value?: string;
  onChange: (pageId: string) => void;
  placeholder?: string;
}

export function PageSelector({ value, onChange, placeholder = "Select a page..." }: PageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const result = await getPages();
      setPages(result || []);
    } catch (error) {
      console.error("Failed to load pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPage = useMemo(() => {
    return pages.find(p => p.id === value);
  }, [pages, value]);

  const filteredPages = useMemo(() => {
    if (!search) return pages;
    const lowerSearch = search.toLowerCase();
    return pages.filter(page => {
      const title = typeof page.title === 'string' ? page.title : page.title.default;
      return (title?.toLowerCase() || "").includes(lowerSearch) ||
      page.slug.toLowerCase().includes(lowerSearch);
    });
  }, [pages, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedPage ? (
              <span className="flex items-center gap-2">
                <span className="font-medium">
                  {typeof selectedPage.title === 'string' ? selectedPage.title : (selectedPage.title.default || "Untitled")}
                </span>
                <span className="text-xs text-muted-foreground">/{selectedPage.slug}</span>
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search pages..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading pages...
              </div>
            ) : filteredPages.length === 0 ? (
              <CommandEmpty>No pages found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredPages.map((page) => (
                  <CommandItem
                    key={page.id}
                    value={page.id}
                    onSelect={() => {
                      onChange(page.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === page.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-medium truncate">
                        {typeof page.title === 'string' ? page.title : (page.title.default || "Untitled")}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        /{page.slug}
                      </span>
                    </div>
                    {page.status !== "published" && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted">
                        {page.status}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
