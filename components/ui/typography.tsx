import Link from "next/link"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface TypographyProps {
  children: ReactNode
  className?: string
}

interface LinkTitleProps extends TypographyProps {
  href: string
}

export const HeroTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn("font-display text-5xl sm:text-6xl lg:text-8xl font-bold text-white", className)}>{children}</h1>
)

export const HeroSubtitle = ({ children, className }: TypographyProps) => (
  <p className={cn("text-xl sm:text-2xl lg:text-4xl text-white", className)}>{children}</p>
)

export const PageTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn("font-display text-3xl md:text-4xl font-bold text-brand-primary", className)}>{children}</h1>
)

export const SectionTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cn("font-display text-3xl md:text-4xl font-bold text-brand-primary", className)}>{children}</h2>
)

export const SectionSubtitle = ({ children, className }: TypographyProps) => (
  <h3 className={cn("font-display text-2xl md:text-3xl font-bold text-brand-primary", className)}>{children}</h3>
)

export const CardTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cn("font-display text-xl sm:text-2xl text-brand-primary", className)}>{children}</h2>
)

export const WidgetTitle = ({ children, className }: TypographyProps) => (
  <h3 className={cn("font-display text-xl text-brand-primary", className)}>{children}</h3>
)

export const StatValue = ({ children, className }: TypographyProps) => (
  <span className={cn("font-display text-xl sm:text-2xl font-bold text-brand-primary", className)}>{children}</span>
)

export const BodyText = ({ children, className }: TypographyProps) => (
  <p className={cn("text-base text-body leading-relaxed", className)}>{children}</p>
)

export const Excerpt = ({ children, className }: TypographyProps) => (
  <p className={cn("text-body-secondary leading-relaxed line-clamp-3", className)}>{children}</p>
)

export const MetaText = ({ children, className }: TypographyProps) => (
  <span className={cn("text-sm text-muted-foreground", className)}>{children}</span>
)

export const SmallText = ({ children, className }: TypographyProps) => (
  <span className={cn("text-xs text-muted-foreground", className)}>{children}</span>
)

export const Label = ({ children, className }: TypographyProps) => (
  <span className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>{children}</span>
)

export const H3 = WidgetTitle

export const PageSubtitle = ({ children, className }: TypographyProps) => (
  <p className={cn("text-xl text-body leading-relaxed", className)}>{children}</p>
)

export const SectionSubTitle = SectionSubtitle

export const LinkTitle = ({ children, href, className }: LinkTitleProps) => (
  <Link href={href} className={cn("font-display text-xl sm:text-2xl text-brand-primary", className)}>{children}</Link>
)
