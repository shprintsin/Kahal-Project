import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { DocFrontmatter } from "./types"

const DOCS_DIR = path.join(process.cwd(), "content", "docs")
const VALID_EXTENSIONS = [".md", ".mdx"]

function resolveDocFile(slug: string[]): string | null {
  const basePath = path.join(DOCS_DIR, ...slug)

  for (const ext of VALID_EXTENSIONS) {
    const filePath = basePath + ext
    if (fs.existsSync(filePath)) return filePath
  }

  for (const ext of VALID_EXTENSIONS) {
    const indexPath = path.join(basePath, `index${ext}`)
    if (fs.existsSync(indexPath)) return indexPath
  }

  return null
}

export function getDocBySlug(slug: string[]): {
  frontmatter: DocFrontmatter
  rawContent: string
} | null {
  const filePath = resolveDocFile(slug)
  if (!filePath) return null

  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(fileContent)

  return {
    frontmatter: {
      title: data.title || slug[slug.length - 1] || "תיעוד",
      description: data.description,
      order: data.order,
      lang: data.lang,
    },
    rawContent: content,
  }
}

function walkDir(dir: string, baseSlug: string[] = []): string[][] {
  if (!fs.existsSync(dir)) return []

  const slugs: string[][] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      slugs.push(...walkDir(path.join(dir, entry.name), [...baseSlug, entry.name]))
    } else if (VALID_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      const nameWithoutExt = entry.name.replace(/\.(md|mdx)$/, "")
      if (nameWithoutExt === "index") {
        if (baseSlug.length > 0) {
          slugs.push(baseSlug)
        }
      } else {
        slugs.push([...baseSlug, nameWithoutExt])
      }
    }
  }

  return slugs
}

export function getAllDocSlugs(): string[][] {
  return walkDir(DOCS_DIR)
}
