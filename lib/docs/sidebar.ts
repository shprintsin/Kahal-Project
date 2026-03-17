import fs from "fs"
import path from "path"
import matter from "gray-matter"
import type { SidebarItem } from "./types"

const DOCS_DIR = path.join(process.cwd(), "content", "docs")
const VALID_EXTENSIONS = [".md", ".mdx"]

function readFrontmatter(filePath: string): { title: string; order: number } {
  const content = fs.readFileSync(filePath, "utf-8")
  const { data } = matter(content)
  const baseName = path.basename(filePath).replace(/\.(md|mdx)$/, "")
  return {
    title: data.title || baseName,
    order: typeof data.order === "number" ? data.order : 999,
  }
}

function buildTree(dir: string, basePath: string): SidebarItem[] {
  if (!fs.existsSync(dir)) return []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const items: SidebarItem[] = []

  const files = entries.filter(e => !e.isDirectory() && VALID_EXTENSIONS.some(ext => e.name.endsWith(ext)))
  const dirs = entries.filter(e => e.isDirectory())

  for (const file of files) {
    const nameWithoutExt = file.name.replace(/\.(md|mdx)$/, "")
    if (nameWithoutExt === "index") continue

    const filePath = path.join(dir, file.name)
    const { title, order } = readFrontmatter(filePath)

    items.push({
      title,
      href: `${basePath}/${nameWithoutExt}`,
      order,
    })
  }

  for (const subDir of dirs) {
    const subDirPath = path.join(dir, subDir.name)
    const subBasePath = `${basePath}/${subDir.name}`
    const children = buildTree(subDirPath, subBasePath)

    let title = subDir.name
    let order = 999

    for (const ext of VALID_EXTENSIONS) {
      const indexFile = path.join(subDirPath, `index${ext}`)
      if (fs.existsSync(indexFile)) {
        const fm = readFrontmatter(indexFile)
        title = fm.title
        order = fm.order
        break
      }
    }

    items.push({
      title,
      href: subBasePath,
      order,
      children: children.length > 0 ? children : undefined,
    })
  }

  items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "he"))

  return items
}

export function buildSidebarTree(): SidebarItem[] {
  return buildTree(DOCS_DIR, "/docs")
}
