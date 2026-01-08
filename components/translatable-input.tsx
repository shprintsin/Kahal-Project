"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Language = "en" | "he" | "pl" | "ru" | "yid";

interface I18nValue {
  en?: string;
  he?: string;
  pl?: string;
  ru?: string;
  yid?: string;
  [key: string]: string | undefined;
}

interface TranslatableInputProps {
  value?: I18nValue;
  onChange: (value: I18nValue) => void;
  label?: string;
  variant?: "input" | "textarea";
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const LANGUAGES: { code: Language; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "EN", dir: "ltr" },
  { code: "he", label: "HE", dir: "rtl" },
  { code: "pl", label: "PL", dir: "ltr" },
];

export function TranslatableInput({
  value = {},
  onChange,
  label,
  variant = "input",
  placeholder,
  required = false,
  className,
}: TranslatableInputProps) {
  const [activeLanguage, setActiveLanguage] = React.useState<Language>("en");

  const handleChange = (newValue: string) => {
    onChange({
      ...value,
      [activeLanguage]: newValue,
    });
  };

  const currentValue = value[activeLanguage] || "";
  const currentDir = LANGUAGES.find((l) => l.code === activeLanguage)?.dir ?? "ltr";


  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {/* Language Tabs */}
      <div className="flex gap-1 border-b">
        {LANGUAGES.map((lang) => {
          const hasContent = ((value?.[lang.code] ?? "") as string).trim().length > 0;
          const isActive = activeLanguage === lang.code;
          
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLanguage(lang.code)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium transition-colors relative",
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lang.label}
              {/* Indicator dot */}
              <span
                className={cn(
                  "absolute top-1 right-1 w-1.5 h-1.5 rounded-full",
                  hasContent ? "bg-green-500" : "bg-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Input Field */}
      <div>
        {variant === "input" ? (
          <Input
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            dir={currentDir}
            placeholder={placeholder}
            className={cn(currentDir === "rtl" && "text-right")}
          />
        ) : (
          <Textarea
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            dir={currentDir}
            placeholder={placeholder}
            className={cn(currentDir === "rtl" && "text-right", "min-h-[100px]")}
          />
        )}
      </div>
    </div>
  );
}
