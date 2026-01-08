"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { ExpandableMenuItem } from "./expandable-menu-item";
import { Plus } from "lucide-react";
import type { MenuItem, ItemVariant } from "@/app/admin/types/menus";

interface InlineMenuListProps {
  items: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  onAdd: () => void;
  allowNesting?: boolean;
  variantOptions?: ItemVariant[];
  addButtonText?: string;
}

export function InlineMenuList({
  items,
  onChange,
  onAdd,
  allowNesting = false,
  variantOptions = ["DEFAULT"],
  addButtonText = "Add Menu Item",
}: InlineMenuListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex).map(
          (item, index) => ({ ...item, order: index })
        );
        onChange(newItems);
      }
    }
  };

  const handleItemChange = (index: number, updatedItem: MenuItem) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  const handleItemDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems.map((item, i) => ({ ...item, order: i })));
  };

  const handleAddChild = (parentIndex: number) => {
    const newChild: MenuItem = {
      id: `child-${Date.now()}`,
      label: { default: "", translations: {} },
      variant: "DEFAULT",
      order: (items[parentIndex].children?.length || 0),
      parentId: items[parentIndex].id,
    };

    const newItems = [...items];
    if (!newItems[parentIndex].children) {
      newItems[parentIndex].children = [];
    }
    newItems[parentIndex].children!.push(newChild);
    onChange(newItems);
  };

  // Check if last item is a placeholder (empty label)
  const lastItem = items[items.length - 1];
  const hasPlaceholder = lastItem && !lastItem.label.default && !(lastItem as any).url && !lastItem.pageId;

  // Ensure we always have a placeholder
  const displayItems = hasPlaceholder ? items : [
    ...items,
    {
      id: `placeholder-${Date.now()}`,
      label: { default: "", translations: {} },
      variant: variantOptions?.[0] || "DEFAULT",
      order: items.length,
      isPlaceholder: true,
    } as MenuItem & { isPlaceholder?: boolean }
  ];

  const handlePlaceholderChange = (index: number, updatedItem: MenuItem) => {
    // When placeholder is edited, convert it to a real item
    const itemWithFlag = updatedItem as MenuItem & { isPlaceholder?: boolean };
    
    if (itemWithFlag.isPlaceholder && (updatedItem.label.default || updatedItem.url || updatedItem.pageId)) {
      // Remove placeholder flag and treat as real item
      const { isPlaceholder, ...realItem } = itemWithFlag;
      const newItems = [...items, realItem];
      onChange(newItems);
      
      // Focus on the newly created item after a short delay
      setTimeout(() => {
        const inputs = document.querySelectorAll('[data-menu-item] input[type="text"]');
        const lastInput = inputs[inputs.length - 2] as HTMLInputElement; // -2 because placeholder is last
        if (lastInput) {
          lastInput.focus();
          lastInput.select();
        }
      }, 100);
    } else if (!itemWithFlag.isPlaceholder) {
      // Update existing real item
      handleItemChange(index, updatedItem);
    }
  };

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={displayItems.map(item => item.id || `item-${Math.random()}`)} strategy={verticalListSortingStrategy}>
          {displayItems.map((item, index) => {
            const itemWithFlag = item as MenuItem & { isPlaceholder?: boolean };
            const isLast = index === displayItems.length - 1;
            
            return (
              <ExpandableMenuItem
                key={item.id || index}
                item={item}
                onChange={(updatedItem) => {
                  if (itemWithFlag.isPlaceholder) {
                    handlePlaceholderChange(index, updatedItem);
                  } else {
                    handleItemChange(index, updatedItem);
                  }
                }}
                onDelete={itemWithFlag.isPlaceholder ? undefined : () => handleItemDelete(index)}
                onAddChild={allowNesting && !itemWithFlag.isPlaceholder ? () => handleAddChild(index) : undefined}
                allowNesting={allowNesting}
                variantOptions={variantOptions}
                isPlaceholder={itemWithFlag.isPlaceholder}
              />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
}
