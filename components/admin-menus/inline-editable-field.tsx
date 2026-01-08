"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, X, Edit2 } from "lucide-react";

interface InlineEditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "textarea";
  className?: string;
  editClassName?: string;
  displayClassName?: string;
  required?: boolean;
}

export function InlineEditableField({
  value,
  onChange,
  placeholder = "Click to edit",
  type = "text",
  className,
  editClassName,
  displayClassName,
  required = false,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (required && !localValue.trim()) {
      setLocalValue(value);
      setIsEditing(false);
      return;
    }
    onChange(localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type === "text") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    const InputComponent = type === "textarea" ? Textarea : Input;
    return (
      <div className={cn("flex items-start gap-2", className)}>
        <InputComponent
          ref={inputRef as any}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className={cn("flex-1", editClassName)}
          rows={type === "textarea" ? 3 : undefined}
        />
        <div className="flex gap-1 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded text-green-600 dark:text-green-400"
            title="Save"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "text-left w-full px-2 py-1.5 rounded border border-transparent hover:border-input hover:bg-muted/50 transition-colors group relative",
        !value && "text-muted-foreground italic",
        displayClassName
      )}
    >
      {value || placeholder}
      <Edit2 className="h-3 w-3 absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity" />
    </button>
  );
}
