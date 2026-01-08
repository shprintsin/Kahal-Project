import { TOCWidget } from './TOCWidget'

import { CategoriesWidget } from './CategoriesWidget'
import { CiteWidget } from './CiteWidget'
import { Button } from '../ui/button'
import { Download } from 'lucide-react'

export function PostSideBar({ post }: { post: any }) {
  return (
    <div>
      <div className="space-y-8">
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button className="bg-[#0d4d2c] hover:bg-[#083d22]">
            <Download className="ml-2 h-4 w-4" />
            הורד כ-PDF
          </Button>
        </div>
        <TOCWidget post={post} />

        {/* <CategoriesWidget /> */}
        {/* <CiteWidget /> */}
      </div>
    </div>
  )
} 
