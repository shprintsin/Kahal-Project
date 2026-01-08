import { getSeriesDetails } from "../../../../../actions/collections";
import EntityGrid from "../../../../../tables/collections-grid";
import { ViewToggle } from "@/components/admin/view-toggle";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function SeriesDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; seriesId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id: collectionId, seriesId } = await params;
  const sp = await searchParams;
  const view = sp.view === "list" ? "list" : "grid";

  const series = await getSeriesDetails(seriesId);

  if (!series) return notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur flex items-center justify-between">
         <div className="flex flex-col">
             <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                 <Link href={`/admin/collections/${collectionId}/series`} className="hover:underline flex items-center">
                    <ChevronLeft className="w-3 h-3" /> {(series.collection?.nameI18n as any)?.en || "Collection"}
                 </Link>
             </div>
             <h1 className="text-xl font-bold">{(series.nameI18n as any)?.en || "Untitled Series"}</h1>
             <p className="text-sm text-muted-foreground">{series.volumes.length} Volumes</p>
         </div>
         <ViewToggle /> 
      </div>

      <div className="flex-1 overflow-auto">
        {view === "grid" ? (
             <EntityGrid 
                items={series.volumes.map(v => ({
                    id: v.id,
                    type: "VOLUME",
                    name: (v.titleI18n as any)?.en || v.slug,
                    thumbnailUrl: v.thumbnail?.storageFile?.publicUrl ?? v.pages[0]?.images[0]?.storageFile?.publicUrl,
                    childCount: v._count.pages,
                    href: `/admin/collections/volume/${v.id}`
                }))} 
             />
        ) : (
            <div className="p-4 space-y-2">
                 {/* Simple List View Backup - ideally reuse PageList styled component? */}
                 {series.volumes.map(v => (
                    <div key={v.id} className="p-3 border rounded hover:bg-muted/50">
                        {(v.titleI18n as any)?.en || v.slug}
                    </div>
                 ))}
             </div>
        )}
      </div>
    </div>
  );
}
