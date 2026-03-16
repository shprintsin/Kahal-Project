import { getHierarchy } from "@/app/admin/actions/collections";
import HierarchyTree from "../../tables/collections-hierarchy-tree";
import CreateEntityDialog from "../../dialogs/collection-create-dialog";
import { SplitPaneLayout } from "@/app/admin/components/ui/split-pane-layout";

export default async function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hierarchy = await getHierarchy();

  return (
    <SplitPaneLayout
      sidebarTitle="Archive"
      sidebarAction={
        <CreateEntityDialog type="COLLECTION" parentId={null} triggerVariant="icon" />
      }
      sidebarContent={<HierarchyTree data={hierarchy} />}
    >
      {children}
    </SplitPaneLayout>
  );
}
