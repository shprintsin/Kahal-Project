import { getAllCollectionsWithSeries, getCollectionWithSeries } from '@/app/actions/collections';
import { ArchiveLayout } from '../ui/ArchiveLayout';
import { NavigationSidebar } from '../ui/NavigationSidebar';
import { CollectionView } from '../ui/CollectionView';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';

interface PageProps {
  params: Promise<{
    collectionSlug: string;
  }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const { collectionSlug } = await params;
  
  try {
    // Fetch all collections for sidebar
    const collections = await getAllCollectionsWithSeries();
    
    // Fetch specific collection details
    const collection = await getCollectionWithSeries(collectionSlug);
    
    if (!collection) {
      notFound();
    }
    
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navigation={navigation} />
        <div className="flex-1">
          <ArchiveLayout
            sidebar={
              <NavigationSidebar 
                collections={collections}
                selectedCollectionSlug={collectionSlug}
                selectedSeriesSlug={null}
              />
            }
            content={
              <>
                <Breadcrumbs items={[
                  { label: 'ארכיון', href: '/archive', isActive: false },
                  { label: collection.nameI18n?.he || collection.name, isActive: true }
                ]} />
                <CollectionView 
                  collection={collection}
                  collectionSlug={collectionSlug}
                />
              </>
            }
          />
        </div>
        <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
      </div>
    );
  } catch (error) {
    console.error('Error loading collection:', error);
    notFound();
  }
}
