import { getHierarchy } from "@/app/admin/actions/collections";
import HierarchyTree from "../../tables/collections-hierarchy-tree";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateEntityDialog from "../../dialogs/collection-create-dialog";

export default async function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hierarchy = await getHierarchy();

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
          <h2 className="font-semibold text-lg">Archive</h2>
          <CreateEntityDialog type="COLLECTION" parentId={null} triggerVariant="icon" />
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            <HierarchyTree data={hierarchy} />
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
