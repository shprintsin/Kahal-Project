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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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
      id: "new-item-placeholder",
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
      // Generate a Stable ID for the new item
      const { isPlaceholder, ...realItem } = itemWithFlag;
      // If the item id is the placeholder id, give it a real one
      if (realItem.id === "new-item-placeholder") {
          realItem.id = `item-${Date.now()}`;
      }

      const newItems = [...items, realItem];
      onChange(newItems);
      
      // No manual focus hack needed if keys are stable?
      // Actually, if we change ID from "new-item-placeholder" to "item-TIMESTAMP", React WILL unmount and remount.
      // So focus WILL be lost.
      // Strategy: Keep "new-item-placeholder" as the ID for the item being edited? 
      // No, that's bad for the list.
      // Better Strategy: Don't change the ID immediately? 
      // But we need a new placeholder.
      // 
      // If we change the ID, we lose focus.
      // The manual focus hack was trying to solve this.
      // But it was selecting the wrong input.
      
      // Let's try to infer which input needs focus.
      // But passing that info through the change handler is complex.
     
      // Alternative: Don't change ID on the fly?
      // When we add it to the list, it's a "real" item.
      // We can keep the ID as "new-item-placeholder" UNTIL the next session? No.
      
      // Let's reinstate the focus hack but Fix the selector.
      
      setTimeout(() => {
         // We find the item by its NEW id.
         // ExpandableMenuItem puts the id on the root?
         // No, but we can search within the list.
         // Actually, if we just renamed the ID, the key changed.
         
         // If we are appending to the list, the new item is at index `items.length`.
         // We can try to focus the input that has a value?
         
         const lastItem = document.querySelectorAll('[data-menu-item]')[items.length]; // The one we just added (was placeholder, now real)
         if (lastItem) {
             const labelInput = lastItem.querySelector('input[placeholder="Menu item name"]') as HTMLInputElement;
             const urlInput = lastItem.querySelector('input[placeholder="/path or https://..."]') as HTMLInputElement;
             
             if (updatedItem.label.default && labelInput) {
                 labelInput.focus();
                 // labelInput.selectionStart = labelInput.value.length; // cursor at end
             } else if (updatedItem.url && urlInput) {
                 urlInput.focus();
                 // urlInput.selectionStart = urlInput.value.length;
             }
         }
      }, 50);

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
      >
        <SortableContext items={displayItems.map(item => item.id || `temp-${Math.random()}`)} strategy={verticalListSortingStrategy}>
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
