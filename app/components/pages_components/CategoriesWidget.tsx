import { SidebarWidget } from './SidebarWidget'
import { SidebarCard } from './SidebarCard'
import { categories } from '@/app/Data'
import Link from 'next/link'

export function CategoriesWidget() {
  return (
    <SidebarWidget title="קטגוריות">
      <SidebarCard>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/category/${category.id}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-none"
              >
                <span>{category.title}</span>
                {/* You can add a count property to your category data if needed */}
              </Link>
            </li>
          ))}
        </ul>
      </SidebarCard>
    </SidebarWidget>
  )
} 
