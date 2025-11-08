"use client";
import React, { useEffect, useMemo, useState } from "react";
import { trackGenerationEvent } from "@/lib/analytics";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, FileText, FileCode2, FileJson, File, Copy, RefreshCw, Save } from "lucide-react";
import JSZip from "jszip";
import ReactMarkdown from "react-markdown";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/esm/styles/hljs";

type GeneratedFile = { name: string; content: string };

export type GenerationPreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repoName: string;
  techStack: string[];
  files: GeneratedFile[];
  onGenerateAgain?: () => void;
  onSaveToHistory?: () => void;
};

function getFileIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".md")) return <FileText className="h-4 w-4" />;
  if (lower.endsWith(".json")) return <FileJson className="h-4 w-4" />;
  if (/[tj]sx?$/.test(lower)) return <FileCode2 className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

export default function GenerationPreview({ open, onOpenChange, repoName, techStack, files, onGenerateAgain, onSaveToHistory }: GenerationPreviewProps) {
  const [selected, setSelected] = useState(0);
  const selectedFile = files[selected];

  useEffect(() => {
    if (!open) return;
    setSelected(0);
    // celebratory confetti burst
    try {
      confetti({ particleCount: 90, spread: 60, origin: { y: 0.9 } });
    } catch {}
  }, [open]);

  const fileTabs = useMemo(() => files.map((f, i) => ({ id: String(i), label: f.name })), [files]);

  async function downloadAll() {
    const zip = new JSZip();
    const folder = zip.folder(`${repoName}-context-files`)!;
    for (const f of files) {
      folder.file(f.name, f.content ?? "");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${repoName}-context-files.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function copyCurrent() {
    if (!selectedFile) return;
    try {
      await navigator.clipboard.writeText(selectedFile.content || "");
    } catch {
      // ignore
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/50"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="absolute inset-x-0 bottom-0 top-10 mx-auto max-w-6xl overflow-hidden rounded-t-2xl bg-base ring-1 ring-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Success header */}
            <div className="backdrop-blur flex items-center gap-2 border-b px-6 py-4 shine-top">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </motion.div>
              <div className="text-sm font-medium text-foreground">Generation Complete</div>
              <div className="ml-auto text-sm text-foreground/60">{repoName}</div>
            </div>

            <div className="grid h-full grid-rows-[auto_auto_1fr_auto] gap-4 overflow-hidden px-6 py-4">
              {/* Repo info */}
              <Card className="bg-card ring-1 ring-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{repoName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {techStack.map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* File tabs (optional if many) */}
              {files.length > 1 && (
                <Tabs value={String(selected)} onValueChange={(v) => setSelected(Number(v))}>
                  <TabsList className="overflow-x-auto">
                    {fileTabs.map((t) => (
                      <TabsTrigger key={t.id} value={t.id} className="whitespace-nowrap">{t.label}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              )}

              {/* File explorer + content */}
              <div className="grid min-h-0 grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
                {/* Left: file tree */}
                <div className="rounded-lg bg-card ring-1 ring-border shadow-sm">
                  <ul className="max-h-[50vh] overflow-auto p-2 text-sm">
                    {files.map((f, i) => (
                      <li key={f.name}>
                        <button
                          onClick={() => {
                            setSelected(i);
                            trackGenerationEvent('file_previewed', { file_name: f.name });
                          }}
                          className={
                            "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left transition-colors " +
                            (i === selected ? "bg-light shadow-sm" : "hover:bg-secondary/10")
                          }
                        >
                          {getFileIcon(f.name)}
                          <span className="truncate" title={f.name}>{f.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right: content */}
                <div className="relative min-h-0 overflow-hidden rounded-lg bg-background ring-1 ring-border shadow-sm">
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyCurrent} className="gap-2"><Copy className="h-4 w-4" /> Copy</Button>
                  </div>
                  <div className="h-full overflow-auto p-4">
                    {selectedFile?.name?.toLowerCase().endsWith(".md") ? (
                      <article className="prose prose-sm max-w-none">
                        <ReactMarkdown>{selectedFile.content || ""}</ReactMarkdown>
                      </article>
                    ) : (
                      <SyntaxHighlighter language={guessLanguage(selectedFile?.name)} style={docco} customStyle={{ background: "transparent", padding: 0 }}>
                        {selectedFile?.content || ""}
                      </SyntaxHighlighter>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 md:flex-row">
                <div className="text-xs text-foreground/60">Review and save your generated context files.</div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button onClick={downloadAll} className="gap-2 px-5 py-5 text-base shadow-lg hover:-translate-y-0.5 hover:shadow-xl"><Download className="h-5 w-5" /> Download All Files (.zip)</Button>
                  <Button variant="secondary" onClick={onSaveToHistory} className="gap-2"><Save className="h-4 w-4" /> Save to History</Button>
                  <Button variant="ghost" onClick={onGenerateAgain} className="gap-2"><RefreshCw className="h-4 w-4" /> Generate Again</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function guessLanguage(name?: string) {
  if (!name) return "text";
  const lower = name.toLowerCase();
  if (lower.endsWith(".ts")) return "typescript";
  if (lower.endsWith(".tsx")) return "tsx";
  if (lower.endsWith(".js")) return "javascript";
  if (lower.endsWith(".jsx")) return "jsx";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".md")) return "markdown";
  if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
  return "text";
}


