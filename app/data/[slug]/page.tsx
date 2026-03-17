import { notFound } from 'next/navigation';
import DatasetLandingPage from '@/app/components/pages_components/DatasetLandingPage';
import { getDatasetBySlug } from '@/app/admin/actions/datasets';
import { getSiteShellData } from '@/app/lib/get-navigation';
import { SetEditUrl } from '@/components/ui/admin-toolbar';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DatasetPage({ params }: PageProps) {
  const { slug } = await params;
  const [apiDataset, shellData] = await Promise.all([
    getDatasetBySlug(slug, { includeResources: true }),
    getSiteShellData(),
  ]);

  if (!apiDataset) {
    notFound();
  }

  const viewDataset: any = {
    ...apiDataset,
    category: apiDataset.category?.title || "כללי",
    last_updated: apiDataset.updatedAt,
    temporal_coverage: (apiDataset.minYear && apiDataset.maxYear) ? {
      start_year: apiDataset.minYear,
      end_year: apiDataset.maxYear
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
      <SetEditUrl url={`/admin/datasets/${apiDataset.id}`} />
      <DatasetLandingPage dataset={viewDataset} shellData={shellData} />
    </>
  );
}
