// =========================================
// 1. Enums (Matching Prisma Schema)
// =========================================

export type ItemVariant = 'DEFAULT' | 'BUTTON_SOLID' | 'BUTTON_OUTLINE' | 'CARD';
export type MenuType = 'LINK_LIST' | 'RICH_TEXT';
export type MenuLocation = 'HEADER' | 'HERO_GRID' | 'HERO_ACTIONS' | 'HERO_STRIP' | 'FOOTER';

// =========================================
// 2. I18n Primitives
// =========================================

/**
 * Represents your DB pattern: 
 * String column (default) + JSON column (translations)
 */
export interface LocalizedText {
  default: string;
  translations: Record<string, string>; // e.g. { "he": "...", "fr": "..." }
}

// =========================================
// 3. The Core Menu Item (Link/Button/Card)
// =========================================

export interface MenuItem {
  id?: string; // Optional for new items created in UI before saving
  menuId?: string; // The menu this item belongs to
  parentId?: string | null; // For nested items (dropdown children)
  
  // Content
  label: LocalizedText;
  
  // Visuals
  icon?: string;         // FontAwesome class name
  variant: ItemVariant;
  order: number;
  
  // Destination (Logic: if pageId exists, ignore url)
  pageId?: string | null; // UUID of an internal page
  url?: string;           // External URL
  
  // Hierarchy
  children?: MenuItem[];  // Nested dropdown items
}

// =========================================
// 4. Section-Specific Component Types
// =========================================

/**
 * A generic wrapper for a navigation section 
 */
export interface MenuSection {
  id: string; // The UUID of the 'Menu' record in DB
  items: MenuItem[];
}

/**
 * Specific shape for the Footer Columns.
 * Since a Footer Column can be text OR links, we use a discriminated union.
 */
interface FooterColumnBase {
  id?: string;
  order: number;
  title: LocalizedText; // The column header (e.g. "Resources")
}

export interface FooterColumnLinks extends FooterColumnBase {
  type: 'LINK_LIST';
  items: FooterColumnItem[];
}

export interface FooterColumnText extends FooterColumnBase {
  type: 'RICH_TEXT';
  content: LocalizedText; // The HTML or Markdown text
}

export type FooterColumn = FooterColumnLinks | FooterColumnText;

/**
 * Footer column item (for LINK_LIST type columns)
 */
export interface FooterColumnItem {
  id?: string;
  footerColumnId?: string;
  label: LocalizedText;
  icon?: string;
  order: number;
  pageId?: string | null;
  url?: string;
}

// =========================================
// 5. Master Settings State
// =========================================

/**
 * This is the entire state object for your Settings Page form.
 */
export interface SiteSettings {
  // Global App Settings
  copyrightText: LocalizedText;

  // 1. Top Navigation
  header: MenuSection;

  // 2. Hero Section Components
  heroGrid: MenuSection;      // The 4 rectangles (Items must be variant='CARD')
  heroActions: MenuSection;   // The 2 buttons (Items must be variant='BUTTON_*')
  heroStrip: MenuSection;     // The 3 info links

  // 3. Footer Section
  footerColumns: FooterColumn[];
}

// =========================================
// 6. Database Helper Functions & Types
// =========================================

/**
 * Helper to convert DB format (default + i18n JSON) to LocalizedText
 */
export function toLocalizedText(defaultText: string, i18nJson: Record<string, string> | null): LocalizedText {
  return {
    default: defaultText,
    translations: i18nJson || {}
  };
}

/**
 * Helper to extract default text from LocalizedText
 */
export function getDefaultText(localized: LocalizedText): string {
  return localized.default;
}

/**
 * Helper to extract i18n translations from LocalizedText
 */
export function getTranslations(localized: LocalizedText): Record<string, string> {
  return localized.translations;
}

/**
 * Menu item with nested children (for database queries)
 */
export interface MenuItemWithChildren extends Omit<MenuItem, 'children'> {
  children: MenuItemWithChildren[];
}
 