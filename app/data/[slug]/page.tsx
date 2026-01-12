import { notFound } from 'next/navigation';
import DatasetLandingPage from '@/app/components/pages_components/DatasetLandingPage';
import { getDatasetBySlug } from '@/app/admin/actions/datasets';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DatasetPage({ params }: PageProps) {
  const { slug } = await params;
  const apiDataset = await getDatasetBySlug(slug);

  if (!apiDataset) {
    notFound();
  }

  // Map backend API ResearchDataset to frontend ResearchDataset (from @/types/dataset)
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
      size_bytes: 0, // Not currently in API but component has formatFileSize
      is_main_file: r.isMainFile
    }))
  };

  return <DatasetLandingPage dataset={viewDataset} />;
}
