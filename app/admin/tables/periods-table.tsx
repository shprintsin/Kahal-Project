"use client";

import * as React from "react";
// Assuming Database type is updated by generation, but if not we can cast or use any.
// Period is newly added, might not be in generated types yet if they are static.
// I'll define a local type or use any for now to avoid build errors.
type Period = any;

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash, Trash2 } from "lucide-react";
import { deletePeriod } from "../actions/periods";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateHe } from "@/app/admin/utils/date";
import { ConfiguredTable, TableColumn } from "@/app/admin/components/tables/configured-table";
import { codeCell, getI18nText, rightActions } from "@/app/admin/components/tables/table-utils";

interface PeriodsTableProps {
  periods: Period[];
}

export function PeriodsTable({ periods }: PeriodsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(periods.map((p: any) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(sid => sid !== id));
    }
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm(`Delete period "${slug}"?`)) return;

    try {
      await deletePeriod(id);
      toast.success("Period deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete period");
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Delete ${selectedIds.length} period(s)?`)) return;

    setIsDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deletePeriod(id)));
      toast.success(`${selectedIds.length} period(s) deleted successfully`);
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete some periods");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected = periods.length > 0 && selectedIds.length === periods.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < periods.length;

  const columns: TableColumn<Period>[] = [
    {
      id: "select",
      header: (
        <Checkbox
          checked={allSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
          className={someSelected ? "opacity-50" : ""}
        />
      ),
      width: "w-12",
      render: (period: any) => (
        <Checkbox
          checked={selectedIds.includes(period.id)}
          onCheckedChange={(checked) => handleSelectOne(period.id, checked as boolean)}
          aria-label={`Select ${period.slug}`}
        />
      ),
    },
    {
      id: "name",
      header: "Name",
      render: (period: any) => (
        <Link href={`/admin/periods/${period.id}`}>
          <Badge variant="outline" className="hover:bg-muted cursor-pointer">
            {getI18nText(period.nameI18n || period.name_i18n)}
          </Badge>
        </Link>
      ),
    },
    { id: "slug", header: "Slug", render: (period: any) => codeCell(period.slug) },
    { id: "start", header: "Start Date", render: (period: any) => formatDateHe(period.dateStart) },
    { id: "end", header: "End Date", render: (period: any) => formatDateHe(period.dateEnd) },
    {
      id: "actions",
      header: <span className="text-right block">Actions</span>,
      render: (period: any) => (
        rightActions(
          <>
            <Link href={`/admin/periods/${period.id}`}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(period.id, period.slug)}
            >
              <Trash className="w-4 h-4 text-destructive" />
            </Button>
          </>
        )
      ),
      align: "right",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} period(s) selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <ConfiguredTable
          data={periods}
          columns={columns}
          rowKey={(p) => p.id}
          rowClassName={(p) => (selectedIds.includes(p.id) ? "bg-muted/50" : undefined)}
        />
      </div>
    </div>
  );
}
