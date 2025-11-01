"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplateLibrary, Template } from "@/components/templates/TemplateLibrary";

export default function TemplatesPage() {
  const { user } = useUser();
  const userId = user?.id || "";
  const templates = useQuery(api.queries.listPromptTemplates, userId ? { userId, includePublic: true } : "skip") as any[] | undefined;
  const saveTemplate = useMutation(api.mutations.savePromptTemplate);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("generic");
  const [template, setTemplate] = React.useState("");

  async function onSave() {
    if (!userId || !name.trim() || !template.trim()) return;
    await saveTemplate({
      userId,
      name,
      description: description || name,
      category: category as any,
      template,
      variables: [],
      isPublic: false,
    });
    setName(""); setDescription(""); setTemplate("");
  }

  const libTemplates: Template[] = (templates || []).map((t: any) => ({
    id: String(t._id),
    name: t.name,
    description: t.description,
    fields: { category: t.category, variables: t.variables },
    preview: <span className="text-xs text-foreground/60">{t.template.slice(0, 100)}{t.template.length > 100 ? "…" : ""}</span>,
  }));

  function applyTemplate(t: Template) {
    // No-op here; this page is for browsing/saving; consumers apply within generators
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-tight">Template Library</h1>
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm font-medium mb-1">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Category</div>
            <select className="w-full rounded-md border border-border bg-background p-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {(["generic","image","video","cursor-app","analysis"] as const).map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <div className="text-sm font-medium mb-1">Description (optional)</div>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
          </div>
          <div className="sm:col-span-2">
            <div className="text-sm font-medium mb-1">Template</div>
            <textarea className="w-full rounded-md border border-border bg-background p-2 text-sm" rows={6} value={template} onChange={(e) => setTemplate(e.target.value)} placeholder{"Use {{variable}} syntax if desired"} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={onSave} disabled={!userId || !name.trim() || !template.trim()}>Save Template</Button>
        </div>
      </Card>

      <TemplateLibrary templates={libTemplates} onApply={applyTemplate} />
    </div>
  );
}


