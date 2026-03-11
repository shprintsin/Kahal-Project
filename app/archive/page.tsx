import { getAllCollectionsWithSeries } from '@/app/actions/collections';
import { ArchiveLayout } from './ui/ArchiveLayout';
import { NavigationSidebar } from './ui/NavigationSidebar';
import { EmptyState } from './ui/EmptyState';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';

export default async function ArchivePage() {
  try {
    const [collections, shellData] = await Promise.all([
      getAllCollectionsWithSeries(),
      getSiteShellData(),
    ]);

    if (!collections || collections.length === 0) {
      return (
        <SiteShell {...shellData}>
          <div className="flex-1 p-4 sm:p-8 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">אין אוספים זמינים</h1>
            <p className="text-gray-600">לא נמצאו אוספים במערכת.</p>
          </div>
        </SiteShell>
      );
    }

    return (
      <SiteShell {...shellData}>
        <div className="flex-1">
          <ArchiveLayout
            sidebar={<NavigationSidebar collections={collections} />}
            content={<EmptyState />}
          />
        </div>
      </SiteShell>
    );
  } catch (error) {
    console.error('Error in ArchivePage:', error);
    return (
      <SiteShell {...shellData}>
        <div className="flex-1 p-4 sm:p-8 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הארכיון</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'שגיאה לא ידועה'}
          </p>
        </div>
      </SiteShell>
    );
  }
}
