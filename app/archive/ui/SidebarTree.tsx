'use client';

import { TreeNode } from '@/types/archive.types';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

interface SidebarTreeProps {
  nodes: TreeNode[];
  currentPath?: string;
}

export function SidebarTree({ nodes, currentPath }: SidebarTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Auto-expand collections that contain the current path
    const initialExpanded = new Set<string>();
    if (currentPath) {
      nodes.forEach(node => {
        if (node.children && node.children.some(child => currentPath.startsWith(child.href || ''))) {
          initialExpanded.add(node.id);
        }
      });
    }
    return initialExpanded;
  });

  // Auto-expand when currentPath changes
  useEffect(() => {
    if (currentPath) {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        nodes.forEach(node => {
          if (node.children && node.children.some(child => currentPath.startsWith(child.href || ''))) {
            newSet.add(node.id);
          }
        });
        return newSet;
      });
    }
  }, [currentPath, nodes]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

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
