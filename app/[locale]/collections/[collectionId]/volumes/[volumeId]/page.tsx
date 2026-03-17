import { notFound } from 'next/navigation';
import { getVolumeWithPagesById } from '@/app/admin/actions/collections';

interface PageProps {
  params: Promise<{
    locale: string;
    collectionId: string;
    volumeId: string;
  }>;
  searchParams: Promise<{
    page?: string;
    pageRange?: string;
  }>;
}

export default async function VolumePage({ params, searchParams }: PageProps) {
  const { volumeId } = await params;
  await searchParams;

  const volume = await getVolumeWithPagesById(volumeId);

  if (!volume) {
    notFound();
  }

  return (
    <p>{JSON.stringify(volume)}</p>
  );
}
