import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeSlug from "rehype-slug"
import rehypeHighlight from "rehype-highlight"
import rehypeKatex from "rehype-katex"
import { getDocBySlug, getAllDocSlugs } from "@/lib/docs/content"
import { extractToc } from "@/lib/docs/toc"
import { mdxComponents } from "@/app/components/docs/mdx-components"
import { DocsBreadcrumbs } from "@/app/components/docs/docs-breadcrumbs"
import { DocsToc } from "@/app/components/docs/docs-toc"
import { buildSidebarTree } from "@/lib/docs/sidebar"
import type { Metadata } from "next"
import type { SidebarItem } from "@/lib/docs/types"

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}): Promise<Metadata> {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) return { title: "תיעוד" }
  return {
    title: `${doc.frontmatter.title} | תיעוד`,
    description: doc.frontmatter.description,
  }
}

function findTitleInSidebar(items: SidebarItem[], href: string): string | undefined {
  for (const item of items) {
    if (item.href === href) return item.title
    if (item.children) {
      const found = findTitleInSidebar(item.children, href)
      if (found) return found
    }
  }
}

function buildBreadcrumbSegments(slug: string[]) {
  if (slug.length <= 1) return []

  const sidebar = buildSidebarTree()
  const segments = []

  for (let i = 0; i < slug.length - 1; i++) {
    const href = "/docs/" + slug.slice(0, i + 1).join("/")
    const title = findTitleInSidebar(sidebar, href) || slug[i]
    segments.push({ label: title, href })
  }

  return segments
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>
}) {
  const { slug } = await params
  const doc = getDocBySlug(slug)
  if (!doc) notFound()

  const toc = extractToc(doc.rawContent)
  const breadcrumbs = buildBreadcrumbSegments(slug)
  const lang = doc.frontmatter.lang || "he"
  const isRtl = lang === "he"

  return (
    <>
      <article className="flex-1 min-w-0" dir={isRtl ? "rtl" : "ltr"}>
        <DocsBreadcrumbs segments={breadcrumbs} currentTitle={doc.frontmatter.title} />
        <h1 className="text-3xl font-bold text-brand-dark mb-8 font-display">
          {doc.frontmatter.title}
        </h1>
        <div className={isRtl ? "text-right" : "text-left"}>
          <MDXRemote
            source={doc.rawContent}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [rehypeSlug, rehypeHighlight, rehypeKatex],
              },
            }}
          />
        </div>
      </article>
      <DocsToc headings={toc} />
    </>
  )
}
