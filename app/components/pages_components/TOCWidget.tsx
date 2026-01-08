import { SidebarWidget } from './SidebarWidget'
import { SidebarCard } from './SidebarCard'
import Link from 'next/link'

export function TOCWidget({ post }: { post: any }) {
  return (
    <SidebarWidget title="תוכן עניינים">
      <SidebarCard>
        <ul className="space-y-2">
          {post.headings && post.headings.length > 0 ? post.headings.map((heading: any) => (
            <li key={heading.id}>
              <Link
                href={`#${heading.id}`}
                className="block p-2 hover:bg-gray-50 text-[#0d4d2c] hover:text-[#083d22]"
                onClick={e => {
                  e.preventDefault()
                  const element = document.getElementById(heading.id)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {heading.title}
              </Link>
            </li>
          )) : (
            <li className="text-gray-500 p-2">אין תוכן עניינים</li>
          )}
        </ul>
      </SidebarCard>
    </SidebarWidget>
  )
} 
