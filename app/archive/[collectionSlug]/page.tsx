import { getAllCollectionsWithSeries, getCollectionWithSeries } from '@/app/actions/collections';
import { ArchiveLayout } from '../ui/ArchiveLayout';
import { NavigationSidebar } from '../ui/NavigationSidebar';
import { CollectionView } from '../ui/CollectionView';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import { getNavigation } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';

interface PageProps {
  params: Promise<{
    collectionSlug: string;
  }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const { collectionSlug } = await params;

  try {
    const [collections, collection, navigation] = await Promise.all([
      getAllCollectionsWithSeries(),
      getCollectionWithSeries(collectionSlug),
      getNavigation(),
    ]);

    if (!collection) {
      notFound();
    }

    return (
      <SiteShell navigation={navigation}>
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
      </SiteShell>
    );
  } catch (error) {
    console.error('Error loading collection:', error);
    notFound();
  }
}
