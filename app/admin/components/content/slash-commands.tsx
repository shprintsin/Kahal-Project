"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Table,
  Minus,
  CheckSquare,
  Link,
  FileText,
} from "lucide-react";

/**
 * SlashCommands - Command palette triggered by typing "/"
 * Obsidian/Notion style block insertion
 */

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  keywords?: string[];
  action: () => void;
}

interface SlashCommandsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (command: SlashCommand) => void;
  position?: { x: number; y: number };
  customCommands?: SlashCommand[];
}

export function SlashCommands({
  open,
  onOpenChange,
  onSelect,
  position,
  customCommands = [],
}: SlashCommandsProps) {
  const defaultCommands: SlashCommand[] = [
    {
      id: "h1",
      label: "Heading 1",
      description: "Large section heading",
      icon: <Heading1 className="w-4 h-4" />,
      keywords: ["h1", "header", "title"],
      action: () => {},
    },
    {
      id: "h2",
      label: "Heading 2",
      description: "Medium section heading",
      icon: <Heading2 className="w-4 h-4" />,
      keywords: ["h2", "header"],
      action: () => {},
    },
    {
      id: "h3",
      label: "Heading 3",
      description: "Small section heading",
      icon: <Heading3 className="w-4 h-4" />,
      keywords: ["h3", "header"],
      action: () => {},
    },
    {
      id: "bullet",
      label: "Bullet List",
      description: "Create a bulleted list",
      icon: <List className="w-4 h-4" />,
      keywords: ["ul", "unordered", "list"],
      action: () => {},
    },
    {
      id: "numbered",
      label: "Numbered List",
      description: "Create a numbered list",
      icon: <ListOrdered className="w-4 h-4" />,
      keywords: ["ol", "ordered", "list"],
      action: () => {},
    },
    {
      id: "todo",
      label: "To-do List",
      description: "Track tasks with a to-do list",
      icon: <CheckSquare className="w-4 h-4" />,
      keywords: ["task", "checkbox"],
      action: () => {},
    },
    {
      id: "quote",
      label: "Quote",
      description: "Capture a quote",
      icon: <Quote className="w-4 h-4" />,
      keywords: ["blockquote", "citation"],
      action: () => {},
    },
    {
      id: "code",
      label: "Code Block",
      description: "Add a code snippet",
      icon: <Code className="w-4 h-4" />,
      keywords: ["codeblock", "pre", "syntax"],
      action: () => {},
    },
    {
      id: "divider",
      label: "Divider",
      description: "Horizontal rule",
      icon: <Minus className="w-4 h-4" />,
      keywords: ["hr", "separator", "line"],
      action: () => {},
    },
    {
      id: "image",
      label: "Image",
      description: "Upload or embed an image",
      icon: <Image className="w-4 h-4" />,
      keywords: ["picture", "photo", "media"],
      action: () => {},
    },
    {
      id: "table",
      label: "Table",
      description: "Add a table",
      icon: <Table className="w-4 h-4" />,
      keywords: ["grid", "spreadsheet"],
      action: () => {},
    },
    {
      id: "link",
      label: "Link",
      description: "Add a hyperlink",
      icon: <Link className="w-4 h-4" />,
      keywords: ["url", "href"],
      action: () => {},
    },
  ];

  const allCommands = [...defaultCommands, ...customCommands];

  const handleSelect = (commandId: string) => {
    const command = allCommands.find((c) => c.id === commandId);
    if (command) {
      onSelect(command);
    }
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="bg-[#252525] border-white/10">
        <CommandInput 
          placeholder="Type a command or search..." 
          className="text-white placeholder:text-white/40"
        />
        <CommandList className="max-h-[300px]">
          <CommandEmpty className="py-6 text-center text-white/40">
            No commands found.
          </CommandEmpty>
          <CommandGroup heading="Basic Blocks" className="text-white/50">
            {allCommands.slice(0, 6).map((cmd) => (
              <CommandItem
                key={cmd.id}
                value={cmd.id}
                onSelect={handleSelect}
                className="flex items-center gap-3 py-2 text-white/80 hover:bg-white/10 cursor-pointer"
              >
                <span className="text-white/50">{cmd.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{cmd.label}</div>
                  <div className="text-xs text-white/40">{cmd.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator className="bg-white/10" />
          <CommandGroup heading="Media & Extras" className="text-white/50">
            {allCommands.slice(6).map((cmd) => (
              <CommandItem
                key={cmd.id}
                value={cmd.id}
                onSelect={handleSelect}
                className="flex items-center gap-3 py-2 text-white/80 hover:bg-white/10 cursor-pointer"
              >
                <span className="text-white/50">{cmd.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{cmd.label}</div>
                  <div className="text-xs text-white/40">{cmd.description}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

/**
 * useSlashCommands - Hook to detect "/" typing and trigger command palette
 */
export function useSlashCommands() {
  const [open, setOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") {
        // Check if at start of line or after whitespace
        const el = target as HTMLTextAreaElement;
        const beforeCursor = el.value.slice(0, el.selectionStart);
        const lastChar = beforeCursor.slice(-1);
        if (beforeCursor === "" || lastChar === "\n" || lastChar === " ") {
          e.preventDefault();
          // Get position for floating menu
          const rect = el.getBoundingClientRect();
          setPosition({ x: rect.left, y: rect.bottom });
          setOpen(true);
        }
      }
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { open, setOpen, position };
}
