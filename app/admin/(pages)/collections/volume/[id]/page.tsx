import { getVolumePages, getVolumeDetails } from "@/app/admin/actions/collections";
import ThumbnailGrid from "./thumbnail-grid";
import PageList from "./page-list";
import PaginationControls from "../../../../tables/pagination-controls";
import { ViewToggle } from "@/components/admin/view-toggle";

export default async function VolumePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  
  const page = Number(sp.page) || 1;
  const limit = Number(sp.limit) || 50;
  const view = sp.view === "list" ? "list" : "grid";

  // Fetch volume details
  const volume = await getVolumeDetails(id);

  if (!volume) return <div>Volume not found</div>;

  const { pages, total } = await getVolumePages(id, page, limit);

  return (
    <div className="flex flex-col h-full min-h-0">
        <div className="p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex items-center justify-between shrink-0">
            <div>
                 <h1 className="text-xl font-bold flex items-center gap-2">
                    <span className="text-muted-foreground font-normal">{(volume.series?.collection?.nameI18n as any)?.en} / {(volume.series?.nameI18n as any)?.en} /</span>
                    {(volume.titleI18n as any)?.en}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {total} Total Pages
                </p>
            </div>
            
            <ViewToggle />
        </div>
        
        <div className="flex-1 overflow-auto p-4 min-h-0">
            {view === "list" ? (
                <PageList initialPages={pages as any} volumeId={id} />
            ) : (
                <ThumbnailGrid 
                    initialPages={pages} 
                    volumeId={id} 
                    seriesId={volume.series?.id}
                    collectionId={volume.series?.collection?.id}
                />
            )}
        </div>

        <PaginationControls total={total} limit={limit} page={page} />
    </div>
  );
}
