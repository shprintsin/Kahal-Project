import { TOCWidget } from './TOCWidget'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function PostSideBar({ post }: { post: any }) {
  return (
    <div>
      <div className="space-y-8">
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button className="bg-brand-primary-dark hover:bg-brand-primary-darker">
            <Download className="ml-2 h-4 w-4" />
            הורד כ-PDF
          </Button>
        </div>
        <TOCWidget post={post} />
      </div>
    </div>
  )
} 
