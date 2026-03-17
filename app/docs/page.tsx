import { notFound } from "next/navigation"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeSlug from "rehype-slug"
import rehypeHighlight from "rehype-highlight"
import rehypeKatex from "rehype-katex"
import { getDocBySlug } from "@/lib/docs/content"
import { extractToc } from "@/lib/docs/toc"
import { mdxComponents } from "@/app/components/docs/mdx-components"
import { DocsToc } from "@/app/components/docs/docs-toc"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const doc = getDocBySlug([])
  if (!doc) return { title: "תיעוד" }
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  }
}

export default function DocsIndexPage() {
  const doc = getDocBySlug([])
  if (!doc) notFound()

  const toc = extractToc(doc.rawContent)
  const lang = doc.frontmatter.lang || "he"
  const isRtl = lang === "he"

  return (
    <>
      <article className="flex-1 min-w-0" dir={isRtl ? "rtl" : "ltr"}>
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
