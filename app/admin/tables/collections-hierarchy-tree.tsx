"use client";

import { useState } from "react";
import { HierarchyNode } from "@/app/admin/actions/collections";
import { ChevronRight, ChevronDown, Folder, FileText, FolderOpen, Layers, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NodeActions from "./collections-node-actions";
import CreateEntityDialog from "../dialogs/collection-create-dialog";
import MetadataDialog from "../dialogs/collection-metadata-dialog";

// Icon mapping per type
const Icons = {
  COLLECTION: Layers,
  SERIES: Folder,
  VOLUME: Book,
};

export default function HierarchyTree({ data }: { data: HierarchyNode[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground p-2">No collections found.</div>;
  }

  return (
    <div className="space-y-1">
      {data.map((node) => (
        <TreeNode key={node.id} node={node} level={0} />
      ))}
    </div>
  );
}

function TreeNode({ node, level }: { node: HierarchyNode; level: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  // Simple check if this volume is active. For parents, we might want to default open if child is active?
  // Implementing purely manual open/close for now to match "all collapse by default" request.

  const hasChildren = node.children && node.children.length > 0;
  const Icon = Icons[node.type] || Folder;

  let href = "#";
  if (node.type === "VOLUME") {
    href = `/admin/collections/volume/${node.id}`;
  } else if (node.type === "SERIES") {
    href = `/admin/collections/${node.collectionId}/series/${node.id}`;
  } else if (node.type === "COLLECTION") {
    href = `/admin/collections/${node.id}`;
  }

  const isActive = pathname === href;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center justify-between py-1 px-2 rounded-md hover:bg-accent/50 cursor-pointer text-sm select-none",
          isActive && "bg-accent text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div className="flex items-center flex-1 overflow-hidden" onClick={() => hasChildren && setIsOpen(!isOpen)}>
          {/* Chevron for expandable items */}
          <div className="w-4 h-4 mr-1 flex items-center justify-center text-muted-foreground">
            {hasChildren && (
              isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />
            )}
            {!hasChildren && node.type !== "VOLUME" && <span className="w-3" />} 
          </div>

          <Link href={href} className="flex items-center flex-1 overflow-hidden truncate">
             <Icon className={cn("w-4 h-4 mr-2 text-muted-foreground", isActive && "text-primary")} />
             <span className="truncate">{node.name}</span>
          </Link>
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            {/* Create Child Action (Only for Collection and Series) */}
            {node.type === "COLLECTION" && (
                <CreateEntityDialog type="SERIES" parentId={node.id} triggerVariant="icon-small" />
            )}
            {node.type === "SERIES" && (
                <CreateEntityDialog type="VOLUME" parentId={node.id} triggerVariant="icon-small" />
            )}
            
            <MetadataDialog node={node} />
            <NodeActions node={node} />
        </div>
      </div>

      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
