"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Edit } from "lucide-react";
import Link from "next/link";
import { formatDateHe } from "@/app/admin/utils/date";
import { ConfiguredTable, TableColumn } from "@/app/admin/components/tables/configured-table";
import { codeCell, getI18nText, mutedCell, rightActions } from "@/app/admin/components/tables/table-utils";

export function SeriesTable({ series }: { series: any[] }) {
  const columns: TableColumn<any>[] = [
    { id: "index", header: "Index #", render: (s) => codeCell(s.index_number || "-") },
    { id: "name", header: "Name", render: (s) => (
      <Link href={`/admin/series/${s.id}/edit`}>
        <span className="font-medium hover:underline cursor-pointer">{getI18nText(s.name_i18n)}</span>
      </Link>
    ) },
    {
      id: "label",
      header: "Volume Label Format",
      render: (s) => mutedCell(s.volume_label_format || "-"),
    },
    { id: "created", header: "Created", render: (s) => formatDateHe(s.created_at) },
    {
      id: "actions",
      header: <span className="text-right block">Actions</span>,
      render: (s) => (
        rightActions(
          <>
            <Link href={`/legacy/collections/volumes?series_id=${s.id}`}>
              <Button variant="outline" size="sm">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Volumes
              </Button>
            </Link>
            <Link href={`/admin/series/${s.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          </>
        )
      ),
      align: "right",
    },
  ];

  return <ConfiguredTable data={series} columns={columns} rowKey={(s) => s.id} />;
}
