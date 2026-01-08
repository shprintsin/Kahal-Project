import { getCollectionDetails } from "../../../actions/collections";
import EntityGrid from "../../../tables/collections-grid";
import { ViewToggle } from "@/components/admin/view-toggle";
import { notFound } from "next/navigation";

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const view = sp.view === "list" ? "list" : "grid"; // Default to grid for nice UI? Or consistent?

  const collection = await getCollectionDetails(id);

  if (!collection) return notFound();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background/95 backdrop-blur flex items-center justify-between">
         <div>
             <h1 className="text-xl font-bold">{(collection.nameI18n as any)?.en || "Untitled Collection"}</h1>
             <p className="text-sm text-muted-foreground">{collection.series.length} Series</p>
         </div>
         <ViewToggle /> 
      </div>

      <div className="flex-1 overflow-auto">
        {view === "grid" ? (
             <EntityGrid 
                items={collection.series.map(s => ({
                    id: s.id,
                    type: "SERIES",
                    name: (s.nameI18n as any)?.en || s.slug,
                    thumbnailUrl: s.thumbnail?.storageFile?.publicUrl ?? s.volumes[0]?.pages[0]?.images[0]?.storageFile?.publicUrl,
                    childCount: s._count.volumes,
                    href: `/admin/collections/${collection.id}/series/${s.id}`
                }))} 
             />
        ) : (
             <div className="p-4 space-y-2">
                 {/* Simple List View Backup */}
                 {collection.series.map(s => (
                    <div key={s.id} className="p-3 border rounded hover:bg-muted/50">
                        {(s.nameI18n as any)?.en || s.slug}
                    </div>
                 ))}
             </div>
        )}
      </div>
    </div>
  );
}
