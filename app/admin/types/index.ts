import {
  AppLanguage,
  ContentStatus,
  User,
  Category,
  Tag,
  Media,
  Post,
  Page,
  Region
} from "@prisma/client";

// Re-export Prisma types with clean names
export type { 
  AppLanguage as Language,
  ContentStatus,
  User,
  Category,
  Tag,
  Media,
  Post,
  Page,
  Region
};

// Editor-specific types
export interface EditorUser {
  id: string;
  email: string | null;
  name?: string | null;
}

// I18n value type for translatable fields
export interface I18nValue {
  en?: string;
  he?: string;
  pl?: string;
}
