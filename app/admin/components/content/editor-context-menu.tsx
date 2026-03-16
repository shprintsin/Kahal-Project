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
      <ContextMenuContent className="w-56 bg-card border-border text-foreground">
        {/* Clipboard Actions */}
        <ContextMenuItem
          onClick={() => onAction?.("cut")}
          disabled={!hasSelection}
          className="hover:bg-accent cursor-pointer"
        >
          <Scissors className="w-4 h-4 mr-2 text-muted-foreground" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onAction?.("copy")}
          disabled={!hasSelection}
          className="hover:bg-accent cursor-pointer"
        >
          <Copy className="w-4 h-4 mr-2 text-muted-foreground" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onAction?.("paste")}
          className="hover:bg-accent cursor-pointer"
        >
          <Clipboard className="w-4 h-4 mr-2 text-muted-foreground" />
          Paste
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-accent" />

        {/* Text Formatting */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-accent cursor-pointer">
            Format
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-card border-border text-foreground">
            <ContextMenuItem
              onClick={() => onAction?.("bold")}
              className="hover:bg-accent cursor-pointer"
            >
              <Bold className="w-4 h-4 mr-2 text-muted-foreground" />
              Bold
              <ContextMenuShortcut>⌘B</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("italic")}
              className="hover:bg-accent cursor-pointer"
            >
              <Italic className="w-4 h-4 mr-2 text-muted-foreground" />
              Italic
              <ContextMenuShortcut>⌘I</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("underline")}
              className="hover:bg-accent cursor-pointer"
            >
              <Underline className="w-4 h-4 mr-2 text-muted-foreground" />
              Underline
              <ContextMenuShortcut>⌘U</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("strikethrough")}
              className="hover:bg-accent cursor-pointer"
            >
              <Strikethrough className="w-4 h-4 mr-2 text-muted-foreground" />
              Strikethrough
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("code")}
              className="hover:bg-accent cursor-pointer"
            >
              <Code className="w-4 h-4 mr-2 text-muted-foreground" />
              Inline Code
              <ContextMenuShortcut>⌘`</ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Transform to Block */}
        <ContextMenuSub>
          <ContextMenuSubTrigger className="hover:bg-accent cursor-pointer">
            Turn into
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-card border-border text-foreground">
            <ContextMenuItem
              onClick={() => onAction?.("h1")}
              className="hover:bg-accent cursor-pointer"
            >
              <Heading1 className="w-4 h-4 mr-2 text-muted-foreground" />
              Heading 1
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("h2")}
              className="hover:bg-accent cursor-pointer"
            >
              <Heading2 className="w-4 h-4 mr-2 text-muted-foreground" />
              Heading 2
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("h3")}
              className="hover:bg-accent cursor-pointer"
            >
              <Heading3 className="w-4 h-4 mr-2 text-muted-foreground" />
              Heading 3
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("bullet")}
              className="hover:bg-accent cursor-pointer"
            >
              <List className="w-4 h-4 mr-2 text-muted-foreground" />
              Bulleted List
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => onAction?.("quote")}
              className="hover:bg-accent cursor-pointer"
            >
              <Quote className="w-4 h-4 mr-2 text-muted-foreground" />
              Quote
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator className="bg-accent" />

        {/* Insert */}
        <ContextMenuItem
          onClick={() => onAction?.("link")}
          className="hover:bg-accent cursor-pointer"
        >
          <Link className="w-4 h-4 mr-2 text-muted-foreground" />
          Insert Link
          <ContextMenuShortcut>⌘K</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onAction?.("image")}
          className="hover:bg-accent cursor-pointer"
        >
          <Image className="w-4 h-4 mr-2 text-muted-foreground" />
          Insert Image
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
