import { ArrowLeft as FaArrowLeft } from 'lucide-react'
import { ArrowLeft } from "lucide-react"
import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface NavLinkProps {
  children: ReactNode
  className?: string
  href?: string
}

export const SeeMoreButton = ({ children, className, href = "#" }: NavLinkProps) => (
  <a href={href} className={cn("flex justify-end items-center gap-2 font-bold mt-6 text-xl", className)}>
    <h2>{children}</h2>
    <FaArrowLeft />
  </a>
)

export const ReadMore = ({ children, className, href = "#" }: NavLinkProps) => (
  <a
    href={href}
    className={cn(
      "flex justify-between items-center text-brand-secondary hover:text-brand-primary transition-colors duration-200",
      className
    )}
  >
    <span className="font-display font-bold">{children}</span>
    <ArrowLeft className="h-5 w-5" />
  </a>
)
