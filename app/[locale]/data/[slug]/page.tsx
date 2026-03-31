import { notFound } from 'next/navigation';
import DatasetLandingPage from '@/app/components/pages_components/DatasetLandingPage';
import { getMapBySlug } from '@/app/admin/actions/maps';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SetEditUrl } from '@/components/ui/admin-toolbar';
import { MapViewerClient } from '@/app/[locale]/maps/[slug]/MapViewerClient';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function DatasetPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const [apiDataset, shellData] = await Promise.all([
    getMapBySlug(slug, { lang: locale, includeLayers: true, includeResources: true }),
    getSiteShellData(locale),
  ]);

  if (!apiDataset) {
    notFound();
  }

  const hasLayers = Array.isArray(apiDataset.layers) && apiDataset.layers.length > 0;

  if (hasLayers) {
    return <MapViewerClient map={apiDataset as any} shellData={shellData} locale={locale} />;
  }

  const viewDataset: any = {
    ...apiDataset,
    category: apiDataset.category?.title || "כללי",
    categorySlug: apiDataset.category?.slug || null,
    last_updated: apiDataset.updatedAt,
    temporal_coverage: (apiDataset.yearMin && apiDataset.yearMax) ? {
      start_year: apiDataset.yearMin,
      end_year: apiDataset.yearMax
    } : undefined,
    geographic_coverage: apiDataset.regions?.map(r => r.name).join(', ') || "",
    codebook_text: apiDataset.codebookText,
    maturity: (apiDataset.maturity === 'Validated' ? 'verified' :
               apiDataset.maturity === 'Preliminary' ? 'provisional' :
               apiDataset.maturity?.toLowerCase()) || 'provisional',
    resources: (apiDataset.resources || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      url: r.url,
      format: r.format,
      size_bytes: r.sizeBytes || 0,
      is_main_file: r.isMainFile
    }))
  };

  return (
    <>
      <SetEditUrl url={`/admin/datastudio/${apiDataset.id}`} />
      <DatasetLandingPage dataset={viewDataset} shellData={shellData} locale={locale} />
    </>
  );
}
