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
  const [prediction, setPrediction] = React.useState<Prediction | null>(null);

  async function onPredict() {
    if (!user?.id || !prompt.trim()) return;
    setLoading(true);
    try {
      const res = await runPredict({ prompt: prompt.trim(), targetAI, userId: user.id });
      setPrediction(res as unknown as Prediction);
    } finally {
      setLoading(false);
    }
  }

  const confidenceColor = !prediction ? "bg-secondary/40" : prediction.confidence >= 75 ? "bg-green-500" : prediction.confidence >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Input */}
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
                {["GPT-4","Claude","Gemini","Generic AI"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="pt-2">
              <Button onClick={onPredict} disabled={loading || !prompt.trim()} className="shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg">
                {loading ? "Predicting..." : "Predict Output"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Right: Prediction */}
        <Card className="p-4 shadow-xl ring-1 ring-border">
          <h2 className="text-base font-semibold tracking-tight">Prediction</h2>
          {!prediction ? (
            <p className="mt-2 text-sm text-foreground/60">Predicted output, confidence and reasoning will appear here.</p>
          ) : (
            <div className="mt-3 space-y-4">
              {/* Confidence gauge */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Confidence</div>
                  <Badge variant="secondary">{prediction.confidence}%</Badge>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary/40">
                  <div className={`h-3 ${confidenceColor}`} style={{ width: `${prediction.confidence}%` }} />
                </div>
              </div>

              {/* Predicted output as chat bubble */}
              <div>
                <div className="text-sm font-medium">Predicted Output</div>
                <div className="mt-2 rounded-2xl border border-border bg-secondary/10 p-3">
                  <ChatBubble>{prediction.predictedOutput}</ChatBubble>
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(prediction.predictedOutput); } catch {} }} className="shadow-sm hover:shadow-md">Copy</Button>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <div className="text-sm font-medium">Why the AI will respond this way</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                  {prediction.reasoning.split(/\n+/).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              {!!prediction.warnings?.length && (
                <div>
                  <div className="text-sm font-medium">Warnings</div>
                  <div className="mt-2 space-y-2">
                    {prediction.warnings.map((w, i) => (
                      <AlertItem key={i} text={w} />
                    ))}
                  </div>
                </div>
              )}

              {/* Alternatives */}
              {!!prediction.alternatives?.length && (
                <div>
                  <div className="text-sm font-medium">Alternative Suggestions</div>
                  <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {prediction.alternatives.map((a, i) => (
                      <Card key={i} className="p-3 shadow-sm ring-1 ring-border">
                        <div className="text-sm font-medium">Modified prompt</div>
                        <pre className="mt-1 whitespace-pre-wrap text-sm leading-6">{a.modifiedPrompt}</pre>
                        <Separator className="my-2" />
                        <div className="text-xs text-foreground/60">Expected change</div>
                        <p className="text-sm text-foreground/80">{a.expectedChange}</p>
                        <div className="mt-2 flex justify-end">
                          <Button size="sm" variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(a.modifiedPrompt); } catch {} }} className="shadow-sm hover:shadow-md">Try this</Button>
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
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline">Actually run this prompt</Button>
          <Separator orientation="vertical" className="hidden h-6 md:block" />
          <span className="text-sm text-foreground/60">Open with:</span>
          <div className="flex flex-wrap gap-2">
            <Link href="https://chat.openai.com" target="_blank" className="text-sm underline">ChatGPT</Link>
            <Link href="https://claude.ai" target="_blank" className="text-sm underline">Claude</Link>
            <Link href="https://gemini.google.com" target="_blank" className="text-sm underline">Gemini</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="inline-block max-w-full rounded-2xl bg-background p-3 text-sm shadow-[0_1px_0_rgba(255,255,255,0.5)] ring-1 ring-border">{children}</div>
    </div>
  );
}

function AlertItem({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-yellow-300 bg-yellow-50 p-2 text-sm text-yellow-900">
      {text}
    </div>
  );
}


