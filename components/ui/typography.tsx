import { cx } from 'class-variance-authority'
import Link from "next/link"
import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface TypographyProps {
  children: ReactNode
  className?: string
}

interface LinkTitleProps extends TypographyProps {
  href: string
}

export const H3 = ({ children, className }: TypographyProps) => (
  <h3 className={cn("secular text-xl text-[var(--dark-green)] mb-4", className)}>{children}</h3>
)

export const PageTitle = ({ children, className }: TypographyProps) => (
  <h1 className={cn("font-bold secular text-3xl md:text-4xl text-[var(--dark-green)] mb-8", className)}>{children}</h1>
)

export const PageSubtitle = ({ children, className }: TypographyProps) => (
  <p className={cx("text-xl text-gray-600 mb-4", className)}>{children}</p>
)

export const SectionTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cx("text-right font-bold mb-8 secular text-4xl text-emerald-900", className)}>
    {children}
  </h2>
)

export const SectionSubTitle = ({ children, className }: TypographyProps) => (
  <h2 className={cx("text-right mb-4 secular font-bold text-3xl text-emerald-900", className)}>
    {children}
  </h2>
)

export const LinkTitle = ({ children, href }: LinkTitleProps) => (
  <Link href={href} className="secular text-2xl text-[var(--dark-green)] mb-3">{children}</Link>
)
