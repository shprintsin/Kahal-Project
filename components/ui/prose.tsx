import { cn } from "@/lib/utils"

interface ProseProps {
  html: string
  className?: string
  dir?: "rtl" | "ltr"
}

const proseClasses = [
  "prose prose-lg max-w-none p-4 sm:p-8 md:p-12",
  "leading-relaxed text-gray-800",
  "[&>h1]:text-3xl [&>h1]:sm:text-4xl [&>h1]:font-bold [&>h1]:text-brand-dark [&>h1]:mb-6 [&>h1]:mt-8 [&>h1]:font-display",
  "[&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-bold [&>h2]:text-brand-primary [&>h2]:mb-4 [&>h2]:mt-6 [&>h2]:font-display",
  "[&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-semibold [&>h3]:text-brand-primary [&>h3]:mb-3 [&>h3]:mt-5",
  "[&>p]:mb-4 [&>p]:leading-8 [&>p]:text-gray-700",
  "[&>ul]:mb-4 [&>ul]:mr-6 [&>ul]:list-disc",
  "[&>ol]:mb-4 [&>ol]:mr-6 [&>ol]:list-decimal",
  "[&>li]:mb-2 [&>li]:text-gray-700",
  "[&>blockquote]:border-r-4 [&>blockquote]:border-brand-primary [&>blockquote]:pr-4 [&>blockquote]:py-2 [&>blockquote]:my-4 [&>blockquote]:bg-gray-50 [&>blockquote]:italic [&>blockquote]:text-gray-600",
  "[&>a]:text-brand-secondary [&>a]:underline [&>a]:hover:text-brand-primary [&>a]:transition-colors",
  "[&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:text-gray-800",
  "[&>pre]:bg-gray-900 [&>pre]:text-gray-100 [&>pre]:p-4 [&>pre]:rounded-md [&>pre]:overflow-x-auto [&>pre]:my-4",
  "[&>img]:rounded-md [&>img]:shadow-sm [&>img]:my-6",
  "text-right",
].join(" ")

export function Prose({ html, className, dir = "rtl" }: ProseProps) {
  return (
    <div
      className={cn(proseClasses, className)}
      dir={dir}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
