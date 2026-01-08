"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, MapPin } from "lucide-react";
import { Region } from "@prisma/client";

// Use partial type or infer from Prisma logic since Supabase types might lag
// type Region = {
//   id: string;
//   slug: string;
//   name: string;
//   nameI18n: any;
// };

interface RegionInputProps {
  regions: Region[];
  selectedRegionIds: string[];
  onRegionsChange: (regionIds: string[]) => void;
  onCreateRegion: (slug: string) => Promise<Region>;
}

export function RegionInput({ regions, selectedRegionIds, onRegionsChange, onCreateRegion }: RegionInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Region[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedRegions = regions.filter(region => selectedRegionIds.includes(region.id));

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Show suggestions based on current input (up to last semicolon)
    const lastPart = value.split(";").pop()?.trim() || "";
    
    if (lastPart.length > 0) {
      const filtered = regions.filter(region => 
        (region.slug.toLowerCase().includes(lastPart.toLowerCase()) || 
         region.name.toLowerCase().includes(lastPart.toLowerCase())) &&
        !selectedRegionIds.includes(region.id)
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

    // Check if region exists (by slug or name)
    const existingRegion = regions.find(region => 
      region.slug.toLowerCase() === lastPart.toLowerCase() ||
      region.name.toLowerCase() === lastPart.toLowerCase()
    );

    if (existingRegion && !selectedRegionIds.includes(existingRegion.id)) {
      onRegionsChange([...selectedRegionIds, existingRegion.id]);
    } else if (!existingRegion) {
      // Create new
      try {
        const newRegion = await onCreateRegion(lastPart);
        onRegionsChange([...selectedRegionIds, newRegion.id]);
      } catch (error) {
        console.error("Failed to create region:", error);
      }
    }

    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const selectSuggestion = (region: Region) => {
    onRegionsChange([...selectedRegionIds, region.id]);
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeRegion = (regionId: string) => {
    onRegionsChange(selectedRegionIds.filter(id => id !== regionId));
  };

  const getRegionName = (region: Region) => {
    // Prefer English/Hebrew from I18n, fallback to name, then slug
    if (typeof region.nameI18n === "object" && region.nameI18n !== null) {
      return (region.nameI18n as any).en || (region.nameI18n as any).he || Object.values(region.nameI18n as any)[0] || region.name;
    }
    return region.name || region.slug;
  };

  return (
    <div className="space-y-2">
      {/* Selected Regions */}
      {selectedRegions.length > 0 && (
        <div className="flex flex-wrap gap-2">
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

      {/* Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          placeholder="Type regions separated by semicolon (;)"
          className="w-full"
        />
        
        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-md z-50 max-h-48 overflow-auto">
            {suggestions.map(region => (
              <button
                key={region.id}
                type="button"
                onClick={() => selectSuggestion(region)}
                className="w-full px-3 py-2 text-left hover:bg-accent transition-colors text-sm flex items-center gap-2"
              >
                <MapPin className="w-3 h-3 text-muted-foreground" />
                {getRegionName(region)}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Add regions (e.g. "Poland", "Galicia") to categorize by location.
      </p>
    </div>
  );
}
