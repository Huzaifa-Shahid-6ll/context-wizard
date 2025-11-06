"use client";
import React, { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Github, Calendar, Download, Eye, Trash2, Code2, Boxes, Braces, Server } from "lucide-react";
import JSZip from "jszip";
import type { Doc, Id } from "@/../convex/_generated/dataModel";

type Generation = Doc<"generations">;

import { initPostHog, trackEvent } from "@/lib/analytics";

const PAGE_SIZE = 10;

export default function HistoryPage() {
  React.useEffect(() => {
    initPostHog();
    trackEvent('history_page_viewed');
  }, []);
  const { user } = useUser();
  const userId = user?.id;
  const all = useQuery(api.queries.listGenerationsByUser, userId ? { userId } : "skip") as Generation[] | undefined;
  const deleteGeneration = useMutation(api.mutations.deleteGeneration);

  // Filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [stackFilter, setStackFilter] = useState<string>("");
  const [sort, setSort] = useState<"date-desc" | "date-asc" | "status">("date-desc");

  const handleFilterChange = (filterType: string, value: string) => {
    trackEvent('history_filtered', { filter_type: filterType });
    switch (filterType) {
      case 'search':
        setSearch(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'stackFilter':
        setStackFilter(value);
        break;
    }
  };

  const filtered = useMemo(() => {
    let list = (all || []).slice();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(g => (g.repoName || g.repoUrl).toLowerCase().includes(q));
    }
    if (startDate) {
      const s = new Date(startDate).getTime();
      list = list.filter(g => g.createdAt >= s);
    }
    if (endDate) {
      const e = new Date(endDate).getTime();
      list = list.filter(g => g.createdAt <= e);
    }
    if (stackFilter) {
      list = list.filter(g => (g.techStack || []).some(t => t.toLowerCase() === stackFilter.toLowerCase()));
    }
    if (sort === "date-desc") list.sort((a, b) => b.createdAt - a.createdAt);
    else if (sort === "date-asc") list.sort((a, b) => a.createdAt - b.createdAt);
    else if (sort === "status") list.sort((a, b) => a.status.localeCompare(b.status));
    return list;
  }, [all, search, startDate, endDate, stackFilter, sort]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function onDelete(id: string) {
    if (!userId) return;
    trackHistoryEvent('history_delete_clicked', { generation_id: id });
    const confirmed = window.confirm("Delete this generation? This cannot be undone.");
    if (!confirmed) return;
    trackHistoryEvent('history_delete_confirmed', { generation_id: id });
    await deleteGeneration({ id: id as Id<"generations">, userId });
  }

  function relativeTime(ts: number): string {
    const diff = Date.now() - ts;
    const sec = Math.round(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.round(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const d = Math.round(hr / 24);
    return `${d}d ago`;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-primary">Generation History</h1>

      {/* Filters */}
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="col-span-2">
          <SearchInput value={search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Search by repository name" />
        </div>
        <div className="flex items-center gap-2 rounded-md bg-light p-2 ring-1 ring-border">
          <Calendar className="h-4 w-4 text-primary" />
          <Input type="date" value={startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)} className="border-none bg-transparent shadow-none focus-visible:ring-0" />
          <span className="text-sm text-foreground/60">to</span>
          <Input type="date" value={endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)} className="border-none bg-transparent shadow-none focus-visible:ring-0" />
        </div>
        <div>
          <SearchInput placeholder="Filter by tech stack (e.g., React)" value={stackFilter} onChange={(e) => handleFilterChange('stackFilter', e.target.value)} icon={<Github className="h-4 w-4 text-primary" />} />
        </div>
      </div>

      {/* Sorting */}
      <div className="mt-3 flex items-center gap-2">
        <Button variant={sort === "date-desc" ? "default" : "outline"} onClick={() => { setSort("date-desc"); trackEvent('history_sorted', { sort_by: 'date-desc' }); }}>Newest</Button>
        <Button variant={sort === "date-asc" ? "default" : "outline"} onClick={() => { setSort("date-asc"); trackEvent('history_sorted', { sort_by: 'date-asc' }); }}>Oldest</Button>
        <Button variant={sort === "status" ? "default" : "outline"} onClick={() => { setSort("status"); trackEvent('history_sorted', { sort_by: 'status' }); }}>Status</Button>
      </div>

      {/* Table */}
      <Card className="mt-4 ring-1 ring-border shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Tech Stack</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {all === undefined && (
                // Loading skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell><div className="h-4 w-40 rounded bg-secondary/40" /></TableCell>
                    <TableCell><div className="h-4 w-24 rounded bg-secondary/40" /></TableCell>
                    <TableCell><div className="h-4 w-20 rounded bg-secondary/40" /></TableCell>
                    <TableCell><div className="h-4 w-16 rounded bg-secondary/40" /></TableCell>
                    <TableCell className="text-right"><div className="ml-auto h-8 w-24 rounded bg-secondary/40" /></TableCell>
                  </TableRow>
                ))
              )}

              {all !== undefined && pageItems.length === 0 && (
                <>
                  {React.useEffect(() => { trackEvent('history_empty_state_viewed'); }, [])}
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                        <Github className="h-8 w-8 text-foreground/40" />
                        <div className="text-sm text-foreground/60">No generations yet</div>
                        <Button asChild className="mt-2">
                          <a href="/dashboard">Generate your first context files</a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              )}

              {pageItems.map((g, idx) => (
                <TableRow key={g._id} className={(idx % 2 ? "bg-secondary/20 " : "") + "transition-all hover:-translate-y-0.5 hover:shadow-sm"}>
                  <TableCell>
                    <a href={`/dashboard/history?id=${g._id}`} className="flex items-center gap-2" onClick={() => trackEvent('history_item_clicked', { generation_id: g._id })}>
                      <Github className="h-4 w-4" />
                      <span className="font-semibold">{g.repoName || g.repoUrl}</span>
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {(g.techStack || []).slice(0, 6).map((t) => (
                        <span key={t} className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-0.5 text-xs ring-1 ring-border">
                          {getStackIcon(t)}
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground/70">{relativeTime(g.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <div className={"inline-flex rounded-full px-2 py-0.5 text-xs " + (g.status === "completed" ? "bg-green-100 text-green-700" : g.status === "processing" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>{g.status}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto inline-flex items-center gap-1">
                      <Button size="icon" variant="outline" asChild>
                        <a href={`/dashboard/history?id=${g._id}`} title="View" onClick={() => trackEvent('history_item_clicked', { generation_id: g._id })}><Eye className="h-4 w-4" /></a>
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => { trackEvent('download_clicked', { repo_name: g.repoName || g.repoUrl, file_count: (g.files || []).length }); downloadOneZip(g); trackEvent('history_download_clicked', { generation_id: g._id }); }} title="Download"><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="outline" onClick={() => onDelete(g._id)} title="Delete"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {all !== undefined && filtered.length > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-foreground/60">Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// removed unused downloadOne helper

async function downloadOneZip(g: Generation) {
  try {
    const zip = new JSZip();
    const folder = zip.folder(`${g.repoName || "context"}-context-files`)!;
    for (const f of g.files || []) {
      folder.file(f.name, f.content || "");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${g.repoName || "context"}-context-files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    try { (window as any)?.posthog ? (window as any).posthog.capture('download_completed') : undefined; } catch {}
  } catch (e) {
    try { (window as any)?.posthog ? (window as any).posthog.capture('download_failed') : undefined; } catch {}
    throw e;
  }
}

function getStackIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("react")) return <Code2 className="h-3.5 w-3.5 text-primary" />;
  if (n.includes("next")) return <Boxes className="h-3.5 w-3.5 text-primary" />;
  if (n.includes("typescript") || n.includes("javascript")) return <Braces className="h-3.5 w-3.5 text-primary" />;
  if (n.includes("convex") || n.includes("node")) return <Server className="h-3.5 w-3.5 text-primary" />;
  return <Code2 className="h-3.5 w-3.5 text-primary" />;
}


