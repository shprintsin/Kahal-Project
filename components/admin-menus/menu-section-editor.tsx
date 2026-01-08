"use client";

/**
 * Menu Section Editor - Refactored for Inline Editing
 * 
 * Manages a collection of menu items with inline editing (no dialogs).
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineMenuList } from "./inline-menu-list";
import type { MenuItem, MenuSection, ItemVariant } from "@/app/admin/types/menus";

interface MenuSectionEditorProps {
  title: string;
  description?: string;
  section: MenuSection;
  onChange: (section: MenuSection) => void;
  variantOptions?: ItemVariant[];
  allowNesting?: boolean;
}

export function MenuSectionEditor({
  title,
  description,
  section,
  onChange,
  variantOptions,
  allowNesting = true,
}: MenuSectionEditorProps) {
  const handleItemsChange = (newItems: MenuItem[]) => {
    onChange({ ...section, items: newItems });
  };

  const handleAddItem = () => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: { default: "", translations: {} },
      variant: variantOptions?.[0] || "DEFAULT",
      order: section.items.length,
    };

    onChange({
      ...section,
      items: [...section.items, newItem],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <InlineMenuList
          items={section.items}
          onChange={handleItemsChange}
          onAdd={handleAddItem}
          allowNesting={allowNesting}
          variantOptions={variantOptions}
          addButtonText="Add Item"
        />
      </CardContent>
    </Card>
  );
}
