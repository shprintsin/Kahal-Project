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
import { Check, ChevronsUpDown, MapPin, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Region } from "@prisma/client";

interface RegionInputProps {
  regions: Region[];
  selectedRegionIds: string[];
  onRegionsChange: (regionIds: string[]) => void;
  onCreateRegion: (slug: string) => Promise<Region>;
}

export function RegionInput({ regions, selectedRegionIds, onRegionsChange, onCreateRegion }: RegionInputProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const selectedRegions = regions.filter(region => selectedRegionIds.includes(region.id));

  const getRegionName = (region: Region) => {
    if (typeof region.nameI18n === "object" && region.nameI18n !== null) {
      return (region.nameI18n as Record<string, string>).en || (region.nameI18n as Record<string, string>).he || Object.values(region.nameI18n as Record<string, string>)[0] || region.name;
    }
    return region.name || region.slug;
  };

  const availableRegions = React.useMemo(() => {
    const unselected = regions.filter(r => !selectedRegionIds.includes(r.id));
    if (!searchQuery.trim()) return unselected;
    const query = searchQuery.toLowerCase();
    return unselected.filter(region =>
      region.slug.toLowerCase().includes(query) ||
      region.name.toLowerCase().includes(query) ||
      getRegionName(region).toLowerCase().includes(query)
    );
  }, [regions, selectedRegionIds, searchQuery]);

  const showCreateOption =
    searchQuery.trim() &&
    !regions.some(region =>
      region.slug.toLowerCase() === searchQuery.trim().toLowerCase() ||
      region.name.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  const toggleRegion = (regionId: string) => {
    if (selectedRegionIds.includes(regionId)) {
      onRegionsChange(selectedRegionIds.filter(id => id !== regionId));
    } else {
      onRegionsChange([...selectedRegionIds, regionId]);
    }
  };

  const handleCreate = async () => {
    if (!searchQuery.trim()) return;
    setIsCreating(true);
    try {
      const newRegion = await onCreateRegion(searchQuery.trim());
      onRegionsChange([...selectedRegionIds, newRegion.id]);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to create region:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const removeRegion = (regionId: string) => {
    onRegionsChange(selectedRegionIds.filter(id => id !== regionId));
  };

  return (
    <div className="space-y-2">
      {selectedRegions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedRegions.map(region => (
            <Badge key={region.id} variant="outline" className="gap-1 pr-1 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
              <MapPin className="w-3 h-3 mr-1" />
              {getRegionName(region)}
              <button
                type="button"
                onClick={() => removeRegion(region.id)}
                className="ml-1 rounded-sm hover:bg-blue-200 text-blue-500 hover:text-blue-700 transition-colors"
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
              {selectedRegions.length > 0
                ? `${selectedRegions.length} region${selectedRegions.length > 1 ? "s" : ""} selected`
                : "Select regions..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search or create region..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                No regions found.
              </CommandEmpty>
              {availableRegions.length > 0 && (
                <CommandGroup>
                  {availableRegions.slice(0, 10).map(region => (
                    <CommandItem
                      key={region.id}
                      value={region.id}
                      onSelect={() => toggleRegion(region.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedRegionIds.includes(region.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                      {getRegionName(region)}
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
