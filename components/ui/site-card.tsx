import { cx } from 'class-variance-authority'
import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
}

export const SiteCard = ({ children, className }: CardProps) => (
  <div className={cx("bg-white shadow-sm p-6 flex flex-col", className)}>
    {children}
  </div>
)

export const SiteCardHeader = ({ children, className }: CardProps) => (
  <h3 className={cx("text-xl font-['Secular_One'] text-gray-800", className)}>{children}</h3>
)

export const SiteCardContent = ({ children, className }: CardProps) => (
  <p className={cx("text-gray-600 leading-relaxed flex-grow", className)}>{children}</p>
)

export const SiteCardFooter = ({ children, className }: CardProps) => (
  <div className={cx("flex justify-between text-gray-500 text-sm mt-auto", className)}>{children}</div>
)
