import { getAllCollectionsWithSeries, getSeriesWithVolumes } from '@/app/actions/collections';
import { ArchiveLayout } from '../../ui/ArchiveLayout';
import { NavigationSidebar } from '../../ui/NavigationSidebar';
import { SeriesView } from '../../ui/SeriesView';
import { Breadcrumbs } from '../../ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import SiteLayout from '@/app/components/layout/SiteLayout';

interface PageProps {
  params: Promise<{
    collectionSlug: string;
    seriesSlug: string;
  }>;
}

export default async function SeriesPage({ params }: PageProps) {
  const { collectionSlug, seriesSlug } = await params;
  
  try {
    // Fetch all collections for sidebar
    const collections = await getAllCollectionsWithSeries();
    
    // Find the collection to get its name for breadcrumbs
    const collection = collections.find(c => c.id === collectionSlug); // Assuming slug is ID as Collection has no slug
    
    if (!collection) {
      notFound();
    }
    
    // Fetch series with volumes
    const seriesData = await getSeriesWithVolumes(collectionSlug, seriesSlug);
    
    if (!seriesData) {
      notFound();
    }
    
    return (
      <SiteLayout>
        <ArchiveLayout
          sidebar={
            <NavigationSidebar
              collections={collections}
              selectedCollectionSlug={collectionSlug}
              selectedSeriesSlug={seriesSlug}
            />
          }
          content={
            <>
              <Breadcrumbs items={[
                { label: 'ארכיון', href: '/archive', isActive: false },
                { label: collection.nameI18n?.he || collection.name, href: `/archive/${collectionSlug}`, isActive: false },
                { label: seriesData.nameI18n?.he || seriesData.slug, isActive: true }
              ]} />
              <SeriesView
                series={seriesData}
                volumes={seriesData.volumes}
                collectionSlug={collectionSlug}
                seriesSlug={seriesSlug}
              />
            </>
          }
        />
      </SiteLayout>
    );
  } catch (error) {
    console.error('Error loading series:', error);
    notFound();
  }
}

