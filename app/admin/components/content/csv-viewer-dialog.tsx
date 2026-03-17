"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react";

const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZE_OPTIONS = [50, 100, 250, 500];

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const parse = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parse(lines[0]);
  const rows = lines.slice(1).map(parse);
  return { headers, rows };
}

const NAME_COLUMNS = ["name", "town", "city", "place", "location", "settlement", "locality"];

interface CsvViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  name: string;
}

export function CsvViewerDialog({ open, onOpenChange, url, name }: CsvViewerDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [allRows, setAllRows] = React.useState<string[][]>([]);
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    if (!open || !url) return;

    setLoading(true);
    setError(null);
    setSearch("");

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        const { headers: h, rows: r } = parseCsv(text);
        setHeaders(h);
        setAllRows(r);
        setPage(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open, url]);

  const nameColIndex = React.useMemo(() => {
    const idx = headers.findIndex((h) =>
      NAME_COLUMNS.includes(h.toLowerCase().trim())
    );
    return idx >= 0 ? idx : -1;
  }, [headers]);

  const filteredRows = React.useMemo(() => {
    if (!search.trim() || nameColIndex < 0) return allRows;
    const q = search.toLowerCase();
    return allRows.filter((row) =>
      (row[nameColIndex] || "").toLowerCase().includes(q)
    );
  }, [allRows, search, nameColIndex]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pageRows = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] !max-w-[96vw] max-h-[90vh] flex flex-col" dir="ltr">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {name}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredRows.length}{filteredRows.length !== allRows.length ? ` / ${allRows.length}` : ""} rows, {headers.length} columns)
            </span>
          </DialogTitle>
          {nameColIndex >= 0 && (
            <div className="relative w-64 mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={`Search by ${headers[nameColIndex]}...`}
                className="pl-8 h-8 text-sm"
              />
            </div>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="py-8 text-center text-destructive text-sm">
            Failed to load: {error}
          </div>
        )}

        {!loading && !error && headers.length > 0 && (
          <>
            <div className="flex-1 overflow-auto border rounded" dir="ltr">
              <table className="w-full text-sm text-left">
                <thead className="sticky top-0 bg-muted z-10">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground border-b w-12">
                      #
                    </th>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className={`px-3 py-2 text-left text-xs font-medium border-b whitespace-nowrap ${
                          i === nameColIndex ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="px-3 py-1.5 text-xs text-muted-foreground">
                        {page * pageSize + ri + 1}
                      </td>
                      {headers.map((_, ci) => (
                        <td key={ci} className="px-3 py-1.5 whitespace-nowrap">
                          {row[ci] || ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={headers.length + 1} className="px-3 py-8 text-center text-muted-foreground">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                Showing {filteredRows.length > 0 ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filteredRows.length)} of {filteredRows.length}
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Rows:</span>
                  <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="h-7 w-[70px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
