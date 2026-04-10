import { getAllCollectionsWithSeries, getCollectionWithSeries } from '@/app/actions/collections';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SiteShell } from '@/components/ui/site-shell';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArchiveLayout } from '../ui/ArchiveLayout';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { CollectionView } from '../ui/CollectionView';
import { NavigationSidebar } from '../ui/NavigationSidebar';

interface PageProps {
  params: Promise<{
    locale: string;
    collectionSlug: string;
  }>;
}

export default async function CollectionPage({ params }: PageProps) {
  const { locale, collectionSlug } = await params;
  const t = await getTranslations({ locale });

  try {
    const [collections, collection, shellData] = await Promise.all([
      getAllCollectionsWithSeries(),
      getCollectionWithSeries(collectionSlug),
      getSiteShellData(locale),
    ]);

    if (!collection) {
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
                selectedSeriesSlug={null}
              />
            }
            content={
              <>
                <Breadcrumbs items={[
                  { label: t('public.archive.title'), href: `/${locale}/archive`, isActive: false },
                  { label: collection.nameI18n?.[locale] || collection.nameI18n?.he || collection.name, isActive: true }
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
