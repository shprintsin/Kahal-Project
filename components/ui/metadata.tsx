import { cx } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Children, Fragment, ReactNode } from "react"
import { LucideIcon } from "lucide-react"

export const MetaRow = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const arrayChildren = Children.toArray(children)
  return (
    <div className={`flex items-center text-sm text-gray-500 mb-6 ${className}`}>
      {arrayChildren.map((child, index) => (
        <Fragment key={index}>
          {child}
          {index < arrayChildren.length - 1 && (
            <span className="mx-2 select-none">•</span>
          )}
        </Fragment>
      ))}
    </div>
  )
}

interface MetaItemProps {
  icon?: LucideIcon
  children: ReactNode
  href?: string
}

export const MetaItem = ({ icon: Icon, children, href }: MetaItemProps) => {
  const content = (
    <div className="flex items-center">
      {Icon && <Icon className="h-4 w-4 ml-1" />}
      <span>{children}</span>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:underline hover:text-[#0d4d2c] transition-colors">
        {content}
      </Link>
    )
  }

  return content
}

export const MetaDataIcons = ({ children, className, content }: { children: ReactNode; className?: string; content?: string }) => (
  <div className={cx("flex items-center text-sm text-gray-500 mb-6", className)}>
    {children}
    <span>{content}</span>
  </div>
)

export const ButtonIcons = ({ children, className }: { children: ReactNode; className?: string }) => (
  <Button className={cn("bg-[#0d4d2c] hover:bg-[#083d22]", className)}>
    {children}
  </Button>
)
