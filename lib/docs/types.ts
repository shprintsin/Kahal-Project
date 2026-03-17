export interface DocFrontmatter {
  title: string
  description?: string
  order?: number
  lang?: "he" | "en"
}

export interface SidebarItem {
  title: string
  href: string
  order: number
  children?: SidebarItem[]
}

export interface TocHeading {
  id: string
  text: string
  level: number
}
