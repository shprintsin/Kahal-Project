import { getAllCollectionsWithSeries } from '@/app/actions/collections';
import { ArchiveLayout } from './ui/ArchiveLayout';
import { NavigationSidebar } from './ui/NavigationSidebar';
import { EmptyState } from './ui/EmptyState';
import SiteLayout from '@/app/components/layout/SiteLayout';

export default async function ArchivePage() {
  try {
    const collections = await getAllCollectionsWithSeries();
    
    if (!collections || collections.length === 0) {
      return (
        <SiteLayout>
          <div className="flex-1 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">אין אוספים זמינים</h1>
            <p className="text-gray-600">לא נמצאו אוספים במערכת.</p>
          </div>
        </SiteLayout>
      );
    }
    
    return (
      <SiteLayout>
        <ArchiveLayout
          sidebar={<NavigationSidebar collections={collections} />}
          content={<EmptyState />}
        />
      </SiteLayout>
    );
  } catch (error) {
    console.error('Error in ArchivePage:', error);
    return (
      <SiteLayout>
        <div className="flex-1 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הארכיון</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'שגיאה לא ידועה'}
          </p>
        </div>
      </SiteLayout>
    );
  }
}
