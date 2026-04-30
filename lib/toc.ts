export type TocHeading = { id: string; level: 2 | 3; text: string }

export function extractTOC(html: string): { html: string; headings: TocHeading[] } {
  const headings: TocHeading[] = []
  const used = new Set<string>()

  const slugify = (raw: string) => {
    const text = raw.replace(/<[^>]+>/g, '').trim()
    const base = text
      .toLowerCase()
      .replace(/[\s\u00A0]+/g, '-')
      .replace(/[^\w\-\u0590-\u05FF\u0400-\u04FF]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)
    return base || `heading-${headings.length + 1}`
  }

  const out = html.replace(
    /<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string | undefined, inner: string) => {
      const attrStr = attrs ?? ''
      const existingId = /\sid=["']([^"']+)["']/i.exec(attrStr)?.[1]
      let id = existingId ?? slugify(inner)
      let i = 1
      while (used.has(id)) {
        i += 1
        id = `${id}-${i}`
      }
      used.add(id)

      const text = inner.replace(/<[^>]+>/g, '').trim()
      headings.push({ id, level: tag.toLowerCase() === 'h2' ? 2 : 3, text })

      const cleanedAttrs = attrStr.replace(/\sid=["'][^"']*["']/i, '')
      return `<${tag}${cleanedAttrs} id="${id}">${inner}</${tag}>`
    },
  )

  return { html: out, headings }
}
