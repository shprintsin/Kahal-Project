export interface NavItem {
  label: string;
  icon: string | null;
  href: string;
  subItems?: NavItem[];
}

export interface Category {
  id: string;
  title: string;
  slug: string;
}

export interface CategoryButton {
  id: string
  title: string
  icon: React.ReactNode;
  href: string
  hoverColor: string
}

export interface FooterItem {
  label: string;
  icon: string;
  href: string;
}
export interface HeroText {
  title: string;
  subtitle: string;
}


export interface ActionButton {
  icon: React.ReactNode;
  title: string;
  href: string;
}

export interface ActionButtonsProps {
  items?: Record<string, ActionButton>;
}

export interface Author {
  name: string;
  role: string;
  affiliation: string;
  email: string;
}

export interface CitationInfo {
  title: string;
  authors: string;
  year: string;
  url: string;
  citationText: string;
}

export interface CreditSectionProps {
  authors: Author[];
  citationInfo: CitationInfo;
}

export interface Post {
  id: string | number;
  title: string;
  excerpt: string;
  date: string;
  author: string; // or Author?
  imageUrl: string;
}

export interface Source {
  id: string | number;
  title: string;
  url: string;
  description?: string;
  date?: string;
  type?: string;
  imageUrl?: string;
}

