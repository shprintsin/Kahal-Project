"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface TableColumn<T> {
  id: string;
  header: React.ReactNode;
  className?: string;
  width?: string;
  align?: "left" | "right" | "center";
  headerClassName?: string;
  cellClassName?: string | ((row: T, index: number) => string | undefined);
  render: (row: T) => React.ReactNode;
}

export interface ConfiguredTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  emptyText?: string;
  rowKey?: (row: T, index: number) => string;
  rowClassName?: (row: T, index: number) => string | undefined;
  headerClassName?: string;
  cellClassName?: string | ((row: T, index: number) => string | undefined);
}

export function ConfiguredTable<T>({
  data,
  columns,
  emptyText = "No records found.",
  rowKey,
  rowClassName,
  headerClassName,
  cellClassName,
}: ConfiguredTableProps<T>) {
  const getKey = React.useCallback(
    (row: T, index: number) => (rowKey ? rowKey(row, index) : String(index)),
    [rowKey]
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={
                  [headerClassName, col.className, col.headerClassName, col.width]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, idx) => (
              <TableRow key={getKey(row, idx)} className={rowClassName?.(row, idx)}>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={
                      [
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                          ? "text-center"
                          : undefined,
                        typeof col.cellClassName === "function" ? col.cellClassName(row, idx) : col.cellClassName,
                        typeof cellClassName === "function" ? cellClassName(row, idx) : cellClassName,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    }
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
