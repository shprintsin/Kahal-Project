"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickIconPickerProps {
  value?: string;
  onChange: (icon: string | undefined) => void;
  className?: string;
}

const COMMON_ICONS = [
  "Home", "FileText", "Map", "Users", "Settings", "Search", "Bell",
  "Calendar", "Mail", "Phone", "Image", "Video", "Music", "Book",
  "Archive", "Database", "Globe", "Heart", "Star", "Tag", "Layers",
  "Package", "ShoppingCart", "CreditCard", "DollarSign", "TrendingUp",
  "BarChart", "PieChart", "Activity", "Zap", "Award", "Target", "Flag"
];

export function QuickIconPicker({ value, onChange, className }: QuickIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = COMMON_ICONS.filter(iconName =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  const IconComponent = value ? (Icons as any)[value] : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 w-10 p-0 relative group",
            className
          )}
          type="button"
        >
          {IconComponent ? (
            <IconComponent className="h-4 w-4" />
          ) : (
            <span className="text-xs text-muted-foreground">Icon</span>
          )}
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove icon"
            >
              ×
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-6 gap-2 p-3">
            {filteredIcons.map((iconName) => {
              const Icon = (Icons as any)[iconName];
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "p-2 rounded hover:bg-muted transition-colors flex items-center justify-center",
                    value === iconName && "bg-primary text-primary-foreground"
                  )}
                  title={iconName}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
