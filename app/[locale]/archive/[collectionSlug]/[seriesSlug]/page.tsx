import { getAllCollectionsWithSeries, getSeriesWithVolumes } from '@/app/actions/collections';
import { ArchiveLayout } from '../../ui/ArchiveLayout';
import { NavigationSidebar } from '../../ui/NavigationSidebar';
import { SeriesView } from '../../ui/SeriesView';
import { Breadcrumbs } from '../../ui/Breadcrumbs';
import { notFound } from 'next/navigation';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';

interface PageProps {
  params: Promise<{
    locale: string;
    collectionSlug: string;
    seriesSlug: string;
  }>;
}

export default async function SeriesPage({ params }: PageProps) {
  const { locale, collectionSlug, seriesSlug } = await params;

  try {
    const [collections, seriesData, shellData] = await Promise.all([
      getAllCollectionsWithSeries(),
      getSeriesWithVolumes(collectionSlug, seriesSlug),
      getSiteShellData(locale),
    ]);

    const collection = collections.find(c => c.id === collectionSlug);

    if (!collection) {
      notFound();
    }

    if (!seriesData) {
      notFound();
    }

    return (
      <SiteShell {...shellData} locale={locale}>
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
      </SiteShell>
    );
  } catch (error) {
    console.error('Error loading series:', error);
    notFound();
  }
}
