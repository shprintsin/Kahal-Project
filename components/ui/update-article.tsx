import { cn } from '@/lib/utils'
import { ReactNode } from "react"

interface UpdateArticleProps {
  title: string
  date?: string
  author?: string
  excerpt?: string
  className?: string
}

export function UpdateArticle({ title, date, author, excerpt, className }: UpdateArticleProps) {
  return (
    <article className={cn('border-b border-b-1 border-border pb-2', className)}>
      <h3 className='text-md font-display text-foreground'>{title}</h3>
      {(date || author) && (
        <small className='text-muted-foreground text-xs'>
          {date && `עדכון אחרון: ${date}`}
          {date && author && ' | '}
          {author}
        </small>
      )}
      {excerpt && <p className='text-body-secondary text-sm leading-relaxed mb-1'>{excerpt}</p>}
    </article>
  )
}

interface SourceLinkProps {
  href: string
  title: string
  icon?: ReactNode
}

export function SourceLink({ href, title, icon }: SourceLinkProps) {
  return (
    <a
      href={href}
      className="flex flex-row gap-2 hover:bg-surface-light p-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
      <div className="flex flex-col">
        <h3 className="text-base font-display text-link-external">{title}</h3>
      </div>
    </a>
  )
}
