"use client";

import * as React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Copy,
  Scissors,
  Clipboard,
  Heading1,
  Heading2,
  Heading3,
  List,
  Quote,
  Image,
} from "lucide-react";

/**
 * EditorContextMenu - Right-click context menu for editor
 */

interface EditorContextMenuProps {
  children: React.ReactNode;
  onAction?: (action: string) => void;
  selectedText?: string;
}

export function EditorContextMenu({
  children,
  onAction,
  selectedText,
}: EditorContextMenuProps) {
  const hasSelection = selectedText && selectedText.length > 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-[#252525] border-white/10 text-white/80">
        {/* Clipboard Actions */}
        <ContextMenuItem
          onClick={() => onAction?.("cut")}
          disabled={!hasSelection}
          className="hover:bg-white/10 cursor-pointer"
        >
          <Scissors className="w-4 h-4 mr-2 text-white/50" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onAction?.("copy")}
          disabled={!hasSelection}
          className="hover:bg-white/10 cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2 text-white/50" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onAction?.("paste")}
          className="hover:bg-white/10 cursor-pointer"
        >
          <Clipboard className="w-4 h-4 mr-2 text-white/50" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        {/* Text Formatting */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-white/10 cursor-pointer">
            Format
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-[#252525] border-white/10 text-white/80">
            <ContextMenuItem
              onClick={() => onAction?.("bold")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Bold className="w-4 h-4 mr-2 text-white/50" />
              Bold
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("italic")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Italic className="w-4 h-4 mr-2 text-white/50" />
              Italic
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("underline")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Underline className="w-4 h-4 mr-2 text-white/50" />
              Underline
              <ContextMenuShortcut>⌘U</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("strikethrough")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Strikethrough className="w-4 h-4 mr-2 text-white/50" />
              Strikethrough
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("code")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Code className="w-4 h-4 mr-2 text-white/50" />
              Inline Code
              <ContextMenuShortcut>⌘`</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Transform to Block */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-white/10 cursor-pointer">
            Turn into
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-[#252525] border-white/10 text-white/80">
            <ContextMenuItem
              onClick={() => onAction?.("h1")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Heading1 className="w-4 h-4 mr-2 text-white/50" />
              Heading 1
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("h2")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Heading2 className="w-4 h-4 mr-2 text-white/50" />
              Heading 2
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("h3")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Heading3 className="w-4 h-4 mr-2 text-white/50" />
              Heading 3
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("bullet")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <List className="w-4 h-4 mr-2 text-white/50" />
              Bulleted List
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("quote")}
              className="hover:bg-white/10 cursor-pointer"
            >
              <Quote className="w-4 h-4 mr-2 text-white/50" />
              Quote
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="bg-white/10" />

        {/* Insert */}
        <ContextMenuItem
          onClick={() => onAction?.("link")}
          className="hover:bg-white/10 cursor-pointer"
        >
          <Link className="w-4 h-4 mr-2 text-white/50" />
          Insert Link
          <ContextMenuShortcut>⌘K</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onAction?.("image")}
          className="hover:bg-white/10 cursor-pointer"
        >
          <Image className="w-4 h-4 mr-2 text-white/50" />
          Insert Image
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
