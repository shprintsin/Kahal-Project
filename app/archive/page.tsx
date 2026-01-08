import { getAllCollectionsWithSeries } from '@/app/actions/collections';
import { ArchiveLayout } from './ui/ArchiveLayout';
import { NavigationSidebar } from './ui/NavigationSidebar';
import { EmptyState } from './ui/EmptyState';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';

export default async function ArchivePage() {
  try {
    const collections = await getAllCollectionsWithSeries();
    
    if (!collections || collections.length === 0) {
      return (
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header navigation={navigation} />
          <div className="flex-1 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">אין אוספים זמינים</h1>
            <p className="text-gray-600">לא נמצאו אוספים במערכת.</p>
          </div>
          <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navigation={navigation} />
        <div className="flex-1">
          <ArchiveLayout
            sidebar={<NavigationSidebar collections={collections} />}
            content={<EmptyState />}
          />
        </div>
        <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
      </div>
    );
  } catch (error) {
    console.error('Error in ArchivePage:', error);
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navigation={navigation} />
        <div className="flex-1 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">שגיאה בטעינת הארכיון</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'שגיאה לא ידועה'}
          </p>
        </div>
        <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
      </div>
    );
  }
}
