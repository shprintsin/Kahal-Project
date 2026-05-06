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
      id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item, i) => item.id || `temp-${i}`)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <ExpandableMenuItem
              key={item.id || index}
              item={item}
              onChange={(updatedItem) => handleItemChange(index, updatedItem)}
              onDelete={() => handleItemDelete(index)}
              onAddChild={allowNesting ? () => handleAddChild(index) : undefined}
              allowNesting={allowNesting}
              variantOptions={variantOptions}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        {addButtonText}
      </Button>
    </div>
  );
}
