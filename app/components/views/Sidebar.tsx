import { Button } from "@/components/ui/button"

export interface SidebarCategory {
  name: string
  count: number
  slug: string
}

export interface SidebarTag {
  name: string
  count: number
  slug: string
}

export interface SidebarRecentPost {
  title: string
  slug: string
}

export interface SidebarProps {
  categories: SidebarCategory[]
  tags: SidebarTag[]
  recentPosts: SidebarRecentPost[]
}

export default function Sidebar({ categories, tags, recentPosts }: SidebarProps) {
  return (
    <div className="space-y-8 bg-[#f8f9fa] p-6 rounded-md">
      <div className="widget">
        <h3 className="secular text-xl text-[var(--dark-green)] mb-4">קטגוריות</h3>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.slug}>
              <a
                href={category.slug}
                className="flex justify-between items-center hover:text-[#5c6d3f] transition-colors duration-200"
              >
                <span>{category.name}</span>
                <span className="text-sm text-gray-500">({category.count})</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      
      {/* <div className="widget">
        <h3 className="secular text-xl text-[var(--dark-green)] mb-4">תגיות</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <a
              key={tag.slug}
              href={tag.slug}
              className="px-3 py-1 bg-white hover:bg-[#5c6d3f] hover:text-white transition-colors duration-200 rounded-md text-sm"
            >
              {tag.name} ({tag.count})
            </a>
          ))}
        </div>
      </div> */}


      {/* <div className="widget">
        <h3 className="secular text-xl text-[var(--dark-green)] mb-4">פוסטים אחרונים</h3>
        <ul className="space-y-3">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <a href={post.slug} className="hover:text-[#5c6d3f] transition-colors duration-200">
                {post.title}
              </a>
            </li>
          ))}
        </ul>
      </div> */}
      {/* <div className="widget">
        <h3 className="secular text-xl text-[var(--dark-green)] mb-4">חיפוש</h3>
        <div className="flex">
          <input
            type="text"
            placeholder="חפש..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-r-none rounded-l-md focus:outline-none focus:ring-1 focus:ring-[var(--dark-green)]"
          />
          <Button className="bg-[var(--dark-green)] text-white rounded-r-none rounded-l-md hover:bg-[#5c6d3f]">
            חפש
          </Button>
        </div>
      </div> */}
    </div>
  )
}

