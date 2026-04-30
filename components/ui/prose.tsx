import { cn } from "@/lib/utils"

interface ProseProps {
  html: string
  className?: string
  dir?: "rtl" | "ltr"
}

const proseClasses = [
  "prose prose-lg max-w-none",
  "leading-[1.7] text-foreground",
  "[&_h1]:text-2xl [&_h1]:sm:text-3xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:font-display [&_h1]:tracking-tight",
  "[&_h2]:text-xl [&_h2]:sm:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:tracking-tight [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-2",
  "[&_h3]:text-lg [&_h3]:sm:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-display",
  "[&_h4]:text-base [&_h4]:sm:text-lg [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mb-2 [&_h4]:mt-5",
  "[&_p]:mb-4 [&_p]:leading-[1.7] [&_p]:text-body",
  "[&_ul]:mb-4 [&_ul]:ms-6 [&_ul]:list-disc [&_ul]:space-y-1",
  "[&_ol]:mb-4 [&_ol]:ms-6 [&_ol]:list-decimal [&_ol]:space-y-1",
  "[&_li]:text-body [&_li]:leading-[1.7]",
  "[&_blockquote]:border-s-4 [&_blockquote]:border-brand-primary [&_blockquote]:ps-5 [&_blockquote]:py-2 [&_blockquote]:my-6 [&_blockquote]:bg-surface-light/60 [&_blockquote]:italic [&_blockquote]:text-body-secondary [&_blockquote]:rounded-e-md",
  "[&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-blue-300 hover:[&_a]:text-blue-800 hover:[&_a]:decoration-blue-600 [&_a]:transition-colors",
  "[&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm [&_code]:text-foreground",
  "[&_pre]:bg-code-bg [&_pre]:text-code-fg [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-6",
  "[&_img]:rounded-lg [&_img]:shadow-sm [&_img]:my-8 [&_img]:mx-auto",
  "[&_hr]:my-10 [&_hr]:border-gray-200",
  "text-start",
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
