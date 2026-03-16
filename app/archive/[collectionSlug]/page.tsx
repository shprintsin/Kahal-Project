import { getAllCollectionsWithSeries, getCollectionWithSeries } from '@/app/actions/collections';
import { ArchiveLayout } from '../ui/ArchiveLayout';
import { NavigationSidebar } from '../ui/NavigationSidebar';
import { CollectionView } from '../ui/CollectionView';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import SiteLayout from '@/app/components/layout/SiteLayout';

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
      <SiteLayout>
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
      </SiteLayout>
    );
  } catch (error) {
    console.error('Error loading collection:', error);
    notFound();
  }
}
