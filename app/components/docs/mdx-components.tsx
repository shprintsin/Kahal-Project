import type { MDXComponents } from "mdx/types"
import Link from "next/link"

export const mdxComponents: MDXComponents = {
  h1: ({ children, id }) => (
    <h1 id={id} className="text-3xl font-bold text-brand-dark mb-6 mt-8 font-display">
      {children}
    </h1>
  ),
  h2: ({ children, id }) => (
    <h2 id={id} className="text-2xl font-bold text-brand-primary mb-4 mt-8 font-display scroll-mt-20">
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="text-xl font-semibold text-brand-primary mb-3 mt-6 scroll-mt-20">
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="text-lg font-semibold mb-2 mt-4 scroll-mt-20">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-8 text-body">{children}</p>
  ),
  a: ({ href, children }) => {
    const isExternal = href?.startsWith("http")
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-secondary underline hover:text-brand-primary transition-colors"
        >
          {children}
        </a>
      )
    }
    return (
      <Link href={href || "#"} className="text-brand-secondary underline hover:text-brand-primary transition-colors">
        {children}
      </Link>
    )
  },
  ul: ({ children }) => (
    <ul className="mb-4 mr-6 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 mr-6 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-body leading-7">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-r-4 border-brand-primary pr-4 py-2 my-4 bg-surface-light italic text-body-secondary">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      )
    }
    return (
      <code className={className} dir="ltr" style={{ textAlign: "left" }}>
        {children}
      </code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 text-sm" dir="ltr" style={{ textAlign: "left" }}>
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse" dir="ltr">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-300 bg-gray-100 px-4 py-2 text-right font-semibold text-sm">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2 text-sm">{children}</td>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || ""} className="rounded-md shadow-sm my-6 max-w-full" />
  ),
}
