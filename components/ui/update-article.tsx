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
    <article className={cn('border-b border-b-1 border-gray-200 pb-2', className)}>
      <h3 className='text-md font-["Secular_One"] text-gray-800'>{title}</h3>
      {(date || author) && (
        <small className='text-gray-500 text-xs'>
          {date && `עדכון אחרון: ${date}`}
          {date && author && ' | '}
          {author}
        </small>
      )}
      {excerpt && <p className='text-gray-600 text-sm leading-relaxed mb-1'>{excerpt}</p>}
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
      className="flex flex-row gap-2 hover:bg-gray-50 p-2"
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
      <div className="flex flex-col">
        <h3 className="text-base secular text-blue-800">{title}</h3>
      </div>
    </a>
  )
}
