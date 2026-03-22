'use client';

import { TreeNode } from '@/types/archive.types';
import Link from 'next/link';
import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

interface SidebarTreeProps {
  nodes: TreeNode[];
  currentPath?: string;
}

function computeAutoExpanded(nodes: TreeNode[], currentPath?: string): Set<string> {
  const set = new Set<string>();
  if (currentPath) {
    nodes.forEach(node => {
      if (node.children && node.children.some(child => currentPath.startsWith(child.href || ''))) {
        set.add(node.id);
      }
    });
  }
  return set;
}

export function SidebarTree({ nodes, currentPath }: SidebarTreeProps) {
  const [manualToggles, setManualToggles] = useState<Record<string, boolean>>({});

  const autoExpanded = useMemo(() => computeAutoExpanded(nodes, currentPath), [nodes, currentPath]);

  const expandedNodes = useMemo(() => {
    const merged = new Set(autoExpanded);
    for (const [id, expanded] of Object.entries(manualToggles)) {
      if (expanded) {
        merged.add(id);
      } else {
        merged.delete(id);
      }
    }
    return merged;
  }, [autoExpanded, manualToggles]);

  const toggleExpand = useCallback((nodeId: string) => {
    setManualToggles(prev => ({
      ...prev,
      [nodeId]: !expandedNodes.has(nodeId),
    }));
  }, [expandedNodes]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-4">
        אין פריטים להצגה
      </div>
    );
  }

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isActive = currentPath === node.href;
    const paddingRight = level * 16;

    return (
      <div key={node.id}>
        <div 
          className={`
            flex items-center justify-between px-3 py-2 rounded-md transition-colors
            ${isActive 
              ? 'bg-[var(--dark-green)] text-white font-semibold' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          style={{ paddingRight: `${paddingRight + 12}px` }}
        >
          {node.href ? (
            <Link href={node.href} className="flex-1 flex items-center justify-between">
              <span className="text-sm">{node.label}</span>
              {node.count !== undefined && (
                <span className="text-xs opacity-70">({node.count})</span>
              )}
            </Link>
          ) : (
            <>
              <span className="text-sm">{node.label}</span>
              {node.count !== undefined && (
                <span className="text-xs opacity-70">({node.count})</span>
              )}
            </>
          )}
          
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="p-1 hover:bg-gray-200 rounded ml-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {nodes.map(node => renderNode(node))}
    </div>
  );
}
