import { getCollectionDetails } from "../../../../actions/collections";
import { SeriesTable } from "../../../../tables/series-table";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SeriesPageProps {
  params: Promise<{ id: string }>;
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { id } = await params;
  const collection = await getCollectionDetails(id);

  if (!collection) return <div>Collection not found</div>;

  const collectionAny = collection as any;

  const collectionName =
    typeof collectionAny.nameI18n === "object" && collectionAny.nameI18n !== null
      ? (collectionAny.nameI18n as any).en || (collectionAny.nameI18n as any).he || "Collection"
      : "Collection";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/collections">Collections</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{collectionName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Series</h2>
          <p className="text-muted-foreground">
            Series in {collectionName}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/collections`}>
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Button>
          </Link>
          <Link href={`/admin/collections/${id}/series/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Series
            </Button>
          </Link>
        </div>
      </div>

      <SeriesTable series={collection.series as any[]} />
    </div>
  );
}
