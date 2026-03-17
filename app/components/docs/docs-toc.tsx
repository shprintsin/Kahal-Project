"use client"

import { useEffect, useState } from "react"
import type { TocHeading } from "@/lib/docs/types"

export function DocsToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    )

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="hidden xl:block w-56 shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <p className="text-sm font-semibold text-gray-500 mb-3">בעמוד הזה</p>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              style={{ paddingRight: heading.level === 3 ? "16px" : "0" }}
            >
              <a
                href={`#${heading.id}`}
                className={`
                  block py-0.5 transition-colors border-r-2
                  ${activeId === heading.id
                    ? "border-brand-primary text-brand-primary font-medium pr-2"
                    : "border-transparent text-gray-500 hover:text-gray-800 pr-2"
                  }
                `}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
