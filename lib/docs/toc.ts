import type { TocHeading } from "./types"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\u0590-\u05FF-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function extractToc(rawMarkdown: string): TocHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: TocHeading[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(rawMarkdown)) !== null) {
    headings.push({
      id: slugify(match[2]),
      text: match[2],
      level: match[1].length,
    })
  }

  return headings
}
