import { getAllCollectionsWithSeries, getSeriesWithVolumes } from '@/app/actions/collections';
import { ArchiveLayout } from '../../ui/ArchiveLayout';
import { NavigationSidebar } from '../../ui/NavigationSidebar';
import { SeriesView } from '../../ui/SeriesView';
import { Breadcrumbs } from '../../ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import Header from '@/app/components/layout/header/Header';
import GlobalFooter from '@/app/components/layout/GlobalFooter';
import { navigation, footerLinksMockData, copyrightTextMockData } from '@/app/Data';

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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header navigation={navigation} />
        <div className="flex-1">
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
        </div>
        <GlobalFooter links={footerLinksMockData} copyrightText={copyrightTextMockData} />
      </div>
    );
  } catch (error) {
    console.error('Error loading series:', error);
    notFound();
  }
}

