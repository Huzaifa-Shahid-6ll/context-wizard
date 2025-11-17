"use client";

import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";

type PromptItem = {
  _id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: number;
};

export default function PromptHistoryPage() {
  const { user } = useUser();
  const userId = user?.id;
  React.useEffect(() => {
    initPostHog();
    trackEvent('prompt_history_viewed');
  }, []);

  const [q, setQ] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<"date" | "type" | "score">("date");
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [selected, setSelected] = React.useState<PromptItem | null>(null);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  const deletePrompt = useMutation(api.mutations.deletePrompt);
  const prompts = useQuery(api.queries.listPromptsByUser, userId ? { userId } : "skip") as PromptItem[] | undefined;

  const filtered = React.useMemo(() => {
    const items = (prompts || []).filter((p) => {
      const matchesText = q.trim() ? (p.title + " " + p.content).toLowerCase().includes(q.trim().toLowerCase()) : true;
      const matchesType = typeFilter === "all" ? true : p.type === typeFilter;
      return matchesText && matchesType;
    });
    const scored = items.map((p) => ({ p, score: Number(p.metadata?.score || p.metadata?.analysisScore || 0) }));
    const sorted = [...scored].sort((a, b) => {
      if (sortBy === "date") return b.p.createdAt - a.p.createdAt;
      if (sortBy === "type") return a.p.type.localeCompare(b.p.type);
      return b.score - a.score;
    }).map(({ p }) => p);
    return sorted;
  }, [prompts, q, typeFilter, sortBy]);

  const paged = filtered.slice(0, page * pageSize);
  const canLoadMore = paged.length < filtered.length;

  function onDelete(id: string) {
    if (!userId) return;
    trackEvent('prompt_deleted');
    deletePrompt({ id: id as Id<"prompts">, clerkId: userId }).catch(() => {});
  }

  function downloadText(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Top Bar */}
      <Card className="mb-4 p-4 shadow-sm ring-1 ring-border">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-2">
            <SearchInput placeholder="Search prompts..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div>
            <Label className="mb-1 block text-xs">Filter by type</Label>
            <Select className="w-full" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {["all","cursor-app","frontend","backend","cursorrules","error-fix","generic","image"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label className="mb-1 block text-xs">Sort by</Label>
            <Select className="w-full" value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "type" | "score")}>
              <option value="date">date</option>
              <option value="type">type</option>
              <option value="score">score</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {/* Empty state */}
      {!prompts || prompts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 p-12 text-center shadow-sm ring-1 ring-border">
          <div className="text-4xl">🗂️</div>
          <div className="text-lg font-semibold">No prompts yet</div>
          <p className="text-sm text-foreground/60">Create your first prompt to see it here.</p>
          <Button asChild>
            <a href="/dashboard/generic-prompt">Create your first prompt</a>
          </Button>
        </Card>
      ) : (
        <>
          {view === "grid" ? (
            <AnimatePresence initial={false}>
              <motion.div
                layout
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              >
                {paged.map((p) => (
                  <motion.div key={p._id} layout variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.2 } } }}>
                    <Card className="group h-full cursor-pointer p-4 shadow-md ring-1 ring-border transition-transform hover:-translate-y-0.5 hover:shadow-lg" onClick={() => setSelected(p)}>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="capitalize">{p.type}</Badge>
                        <div className="text-xs text-foreground/60">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="mt-2 line-clamp-2 text-sm font-medium">{p.title || "Untitled"}</div>
                      <div className="mt-2 line-clamp-3 text-xs text-foreground/70">{p.content}</div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.content).catch(() => {}); trackEvent('prompt_copied_to_clipboard', { prompt_type: p.type, prompt_id: p._id }); }}>Copy</Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); downloadText(p.title || "prompt.txt", p.content, "text/plain"); }}>.txt</Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); downloadText((p.title || "prompt") + ".md", p.content, "text/markdown"); }}>.md</Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(p._id as Id<"prompts">); }}>Delete</Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <Card className="overflow-x-auto p-0 shadow-sm ring-1 ring-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((p) => (
                    <TableRow key={p._id} className="cursor-pointer" onClick={() => setSelected(p)}>
                      <TableCell className="whitespace-nowrap"><Badge variant="secondary" className="capitalize">{p.type}</Badge></TableCell>
                      <TableCell className="w-full">{p.title || "Untitled"}</TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(p.createdAt).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.content).catch(() => {}); trackEvent('prompt_copied_to_clipboard', { prompt_type: p.type, prompt_id: p._id }); }}>Copy</Button>
                        <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); downloadText(p.title || "prompt.txt", p.content, "text/plain"); }}>.txt</Button>
                        <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); downloadText((p.title || "prompt") + ".md", p.content, "text/markdown"); }}>.md</Button>
                        <Button variant="outline" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); onDelete(p._id as Id<"prompts">); }}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Load more */}
          {canLoadMore && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setPage((p) => p + 1)}>Load more</Button>
            </div>
          )}

          {/* Detail Dialog */}
          <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">{selected?.type}</Badge>
                  <span>{selected?.title || "Untitled"}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-2 text-xs text-foreground/60">Created {selected ? new Date(selected.createdAt).toLocaleString() : ""}</div>
              <Separator className="my-3" />
              <div>
                <div className="text-sm font-medium">Full content</div>
                <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary/10 p-3 text-sm leading-6 ring-1 ring-border">{selected?.content}</pre>
              </div>
              {!!selected?.metadata && (
                <div className="mt-4">
                  <div className="text-sm font-medium">Metadata</div>
                  <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary/10 p-3 text-xs leading-6 ring-1 ring-border">{JSON.stringify(selected.metadata, null, 2)}</pre>
                </div>
              )}
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={() => { if (selected) navigator.clipboard.writeText(selected.content).catch(() => {}); }}>Reuse</Button>
                <Button variant="outline">Edit</Button>
                <Button variant="outline" onClick={() => { if (selected) onDelete(selected._id as Id<"prompts">); setSelected(null); }}>Delete</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}


