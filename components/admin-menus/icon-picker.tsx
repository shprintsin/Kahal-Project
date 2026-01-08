/**
 * Visual Icon Picker Component
 * 
 * A modal that allows users to search and select FontAwesome icons visually.
 */

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Common FontAwesome icons (you can expand this list)
const ICON_LIST = [
  "fa-home",
  "fa-map",
  "fa-map-marked-alt",
  "fa-database",
  "fa-chart-bar",
  "fa-archive",
  "fa-book",
  "fa-info-circle",
  "fa-user",
  "fa-users",
  "fa-envelope",
  "fa-phone",
  "fa-graduation-cap",
  "fa-unlock",
  "fa-lock",
  "fa-cog",
  "fa-search",
  "fa-star",
  "fa-heart",
  "fa-shopping-cart",
  "fa-folder",
  "fa-file",
  "fa-image",
  "fa-video",
  "fa-music",
  "fa-download",
  "fa-upload",
  "fa-check",
  "fa-times",
  "fa-plus",
  "fa-minus",
  "fa-arrow-left",
  "fa-arrow-right",
  "fa-arrow-up",
  "fa-arrow-down",
  "fa-calendar",
  "fa-clock",
  "fa-globe",
  "fa-link",
  "fa-external-link-alt",
  "fa-twitter",
  "fa-facebook",
  "fa-instagram",
  "fa-github",
  "fa-linkedin",
  "fa-youtube",
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  triggerClassName?: string;
}

export function IconPicker({ value, onChange, triggerClassName }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!search) return ICON_LIST;
    const searchLower = search.toLowerCase();
    return ICON_LIST.filter((icon) => icon.toLowerCase().includes(searchLower));
  }, [search]);

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={triggerClassName}
        >
          {value ? (
            <span className="flex items-center gap-2">
              <i className={`fas ${value}`} />
              <span className="text-xs">{value}</span>
            </span>
          ) : (
            <span className="text-xs">Select Icon</span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select an Icon</DialogTitle>
          <DialogDescription>
            Search and select a FontAwesome icon for your menu item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search icons... (e.g., map, user, home)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <ScrollArea className="h-96">
            <div className="grid grid-cols-6 gap-2">
              {filteredIcons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleSelect(icon)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:bg-accent ${
                    value === icon
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <i className={`fas ${icon} text-2xl mb-2`} />
                  <span className="text-[10px] text-center text-muted-foreground">
                    {icon.replace("fa-", "")}
                  </span>
                </button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No icons found matching "{search}"
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
