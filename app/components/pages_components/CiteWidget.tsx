import { SidebarWidget } from './SidebarWidget'
import { SidebarCard } from './SidebarCard'
import { citationInfoMockData } from '@/app/Data'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function CiteWidget() {
  return (
    <SidebarWidget title="ציטוט">
      <SidebarCard>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-sm text-gray-700 mb-3">
            {citationInfoMockData.citationText}
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Download className="ml-2 h-4 w-4" />
            העתק
          </Button>
        </div>
      </SidebarCard>
    </SidebarWidget>
  )
} 
