/**
 * Translatable Input Component
 * 
 * An input that supports multiple languages with tabs for default and translations.
 */

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import type { LocalizedText } from "@/app/admin/types/menus";

interface TranslatableInputProps {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  languages?: Array<{ code: string; name: string }>;
}

const DEFAULT_LANGUAGES = [
  { code: "he", name: "עברית" },
  { code: "en", name: "English" },
  { code: "pl", name: "Polski" },
];

export function TranslatableInput({
  value,
  onChange,
  label,
  placeholder,
  multiline = false,
  languages = DEFAULT_LANGUAGES,
}: TranslatableInputProps) {
  const [activeTab, setActiveTab] = useState<string>("default");

  const handleDefaultChange = (newValue: string) => {
    onChange({
      ...value,
      default: newValue,
    });
  };

  const handleTranslationChange = (lang: string, newValue: string) => {
    onChange({
      ...value,
      translations: {
        ...value.translations,
        [lang]: newValue,
      },
    });
  };

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${languages.length + 1}, 1fr)` }}>
          <TabsTrigger value="default">Default</TabsTrigger>
          {languages.map((lang) => (
            <TabsTrigger key={lang.code} value={lang.code}>
              {lang.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="default" className="mt-2">
          <InputComponent
            value={value.default}
            onChange={(e) => handleDefaultChange(e.target.value)}
            placeholder={placeholder}
          />
        </TabsContent>
        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code} className="mt-2">
            <InputComponent
              value={value.translations[lang.code] || ""}
              onChange={(e) => handleTranslationChange(lang.code, e.target.value)}
              placeholder={placeholder}
              dir={lang.code === "he" ? "rtl" : "ltr"}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
