"use client";

import { useLanguage } from "@/lib/i18n/language-provider";
import { getAvailableLanguages } from "@/lib/i18n/load-translations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, Check } from "lucide-react";

const languageNames: Record<string, string> = {
  'he_default': 'עברית',
  'he': 'עברית',
  'en': 'English',
};

export function LanguageSwitcher() {
  const { language, setLanguage, translations } = useLanguage();
  
  // For now, hardcode available languages
  const availableLanguages = ['he_default', 'en'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className="flex items-center justify-between gap-2"
          >
            <span>{languageNames[lang] || lang}</span>
            {language === lang && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
