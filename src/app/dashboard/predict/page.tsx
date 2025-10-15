"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Prediction = {
  predictedOutput: string;
  confidence: number; // 0-100
  reasoning: string;
  warnings: string[];
  alternatives: Array<{ modifiedPrompt: string; expectedChange: string }>;
};

export default function PredictPage() {
  const { user } = useUser();
  const runPredict = useAction(api.promptGenerators.predictPromptOutput);

  const [prompt, setPrompt] = React.useState("");
  const [targetAI, setTargetAI] = React.useState("Generic AI");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Prediction | null>(null);

  async function onPredict() {
    if (!user?.id || !prompt.trim()) return;
    setLoading(true);
    try {
      const res = await runPredict({ prompt: prompt.trim(), targetAI, userId: user.id });
      setResult(res as unknown as Prediction);
    } finally {
      setLoading(false);
    }
  }

  const gaugeColor = !result ? "bg-secondary" : result.confidence >= 70 ? "bg-green-600" : result.confidence >= 40 ? "bg-yellow-500" : "bg-red-600";

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="p-4 shadow-lg ring-1 ring-border">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Prompt</label>
              <textarea
                className="mt-1 w-full rounded-md border border-border bg-background p-3 text-base"
                rows={8}
                placeholder="Paste or write your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Target AI</label>
              <select
                className="w-full rounded-md border border-border bg-background p-2 text-sm"
                value={targetAI}
                onChange={(e) => setTargetAI(e.target.value)}
              >
                {["GPT-4","Claude","Gemini","Generic AI"].map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <Button onClick={onPredict} disabled={loading || !prompt.trim()} className="shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                {loading ? "Predicting..." : "Predict Output"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Prediction Section */}
        <Card className="p-4 shadow-xl ring-1 ring-border">
          <h2 className="text-base font-semibold tracking-tight">Prediction</h2>
          {!result ? (
            <p className="mt-2 text-sm text-foreground/60">Results will appear here after prediction.</p>
          ) : (
            <div className="mt-3 space-y-6">
              {/* Confidence */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium">Confidence</div>
                  <Badge variant="secondary">{result.confidence}%</Badge>
                </div>
                <div className="h-2 w-full rounded bg-secondary/30">
                  <div className={`h-2 rounded ${gaugeColor}`} style={{ width: `${result.confidence}%` }} />
                </div>
              </div>

              {/* Predicted Output - mock chat bubble */}
              <div>
                <div className="mb-2 text-sm font-medium">Predicted Output</div>
                <div className="rounded-2xl bg-light p-4 text-sm shadow-inner ring-1 ring-border">
                  <div className="mx-auto max-w-none whitespace-pre-wrap leading-6">{result.predictedOutput}</div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => copy(result.predictedOutput)} className="shadow-sm hover:shadow-md">Copy</Button>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <div className="mb-2 text-sm font-medium">Why the AI will respond this way</div>
                <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/70">
                  {result.reasoning.split(/\n+/).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              {!!(result.warnings && result.warnings.length) && (
                <div>
                  <div className="mb-2 text-sm font-medium">Warnings</div>
                  <div className="space-y-2">
                    {result.warnings.map((w, idx) => (
                      <div key={idx} className="rounded-md border border-yellow-400/50 bg-yellow-50/40 p-3 text-sm text-yellow-800">
                        {w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {!!(result.alternatives && result.alternatives.length) && (
                <div>
                  <div className="mb-2 text-sm font-medium">Alternative Suggestions</div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {result.alternatives.map((alt, idx) => (
                      <Card key={idx} className="p-3 shadow-sm ring-1 ring-border">
                        <div className="text-xs uppercase tracking-wide text-foreground/60">Modified prompt</div>
                        <div className="mt-1 whitespace-pre-wrap text-sm">{alt.modifiedPrompt}</div>
                        <Separator className="my-2" />
                        <div className="text-xs uppercase tracking-wide text-foreground/60">Expected change</div>
                        <div className="mt-1 text-sm text-foreground/70">{alt.expectedChange}</div>
                        <div className="mt-3 flex justify-end">
                          <Button size="sm" onClick={() => setPrompt(alt.modifiedPrompt)}>Try this</Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Section */}
      <Card className="mt-6 p-4 shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-foreground/70">Want to validate this for real?</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">Actually run this prompt</Button>
            <Button variant="ghost" asChild>
              <Link href="https://chat.openai.com" target="_blank">Open ChatGPT</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="https://claude.ai" target="_blank">Open Claude</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="https://gemini.google.com" target="_blank">Open Gemini</Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}


