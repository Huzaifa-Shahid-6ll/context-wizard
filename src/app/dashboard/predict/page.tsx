"use client";

import React from "react";
import { initPostHog, trackEvent } from "@/lib/analytics";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

type Prediction = {
  predictedOutput: string | { 
    predictedOutput?: string; 
    confidence?: number; 
    reasoning?: string; 
    warnings?: string[]; 
    alternatives?: Array<{ modifiedPrompt: string; expectedChange: string }> 
  };
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
  const [temperature, setTemperature] = React.useState(0.2);
  const [maxTokens, setMaxTokens] = React.useState(500);
  const [systemPrompt, setSystemPrompt] = React.useState("");
  const [expectedType, setExpectedType] = React.useState("Explanation");
  const [expectedLength, setExpectedLength] = React.useState("Standard (100-500)");
  const [knownIssues, setKnownIssues] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [prediction, setPrediction] = React.useState<Prediction | null>(null);

  React.useEffect(() => {
    initPostHog();
    trackEvent('output_predictor_opened');
  }, []);

  async function onPredict() {
    if (!user?.id || !prompt.trim()) return;
    setLoading(true);
    try {
      trackEvent('output_prediction_requested');
      const configLines = [
        `Target AI: ${targetAI}`,
        `Temperature: ${temperature}`,
        `Max tokens: ${maxTokens}`,
        systemPrompt ? `System: ${systemPrompt}` : "",
        `Expected: ${expectedType}, ${expectedLength}`,
        knownIssues.length ? `Known issues: ${knownIssues.join(", ")}` : "",
      ].filter(Boolean).join("\n");

      const res = await runPredict({ prompt: `${prompt.trim()}\n\n${configLines}`, targetAI, userId: user.id });
      setPrediction(res as unknown as Prediction);
      const cs = (() => {
        if (!res) return 0;
        const obj = res as unknown;
        if (obj && typeof obj === 'object') {
          const objRecord = obj as Record<string, unknown>;
          if (typeof objRecord.confidence === 'number') return objRecord.confidence;
          if (objRecord.predictedOutput && typeof objRecord.predictedOutput === 'object') {
            const predictedOutput = objRecord.predictedOutput as Record<string, unknown>;
            if (typeof predictedOutput.confidence === 'number') return predictedOutput.confidence;
          }
        }
        return 0;
      })();
      trackEvent('output_prediction_completed', { confidence_score: cs });
    } finally {
      setLoading(false);
    }
  }

  const getConfidence = () => {
    if (!prediction) return 0;
    if (typeof prediction.predictedOutput === 'object' && prediction.predictedOutput && 'confidence' in prediction.predictedOutput) {
      return (prediction.predictedOutput as { confidence: number }).confidence;
    }
    return prediction.confidence || 0;
  };
  
  const confidence = getConfidence();
  const confidenceColor = !prediction ? "bg-secondary/40" : confidence >= 75 ? "bg-green-500" : confidence >= 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Input */}
        <Card className="p-4 shadow-lg ring-1 ring-border">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Prompt</label>
              <Textarea
                className="mt-1 w-full"
                rows={8}
                placeholder="Paste or write your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Target AI</label>
                <Select className="w-full" value={targetAI} onChange={(e) => setTargetAI(e.target.value)}>
                  {["GPT-4","Claude","Gemini","Generic AI"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Temperature</label>
                <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full" aria-label="Temperature control" />
                <div className="mt-1 text-xs text-foreground/60">Lower = more focused; Higher = more creative ({temperature.toFixed(1)})</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Max tokens</label>
                <Select className="w-full" value={String(maxTokens)} onChange={(e) => setMaxTokens(parseInt(e.target.value))}>
                  {[{label:"Brief (100)",v:100},{label:"Standard (500)",v:500},{label:"Long (1000)",v:1000},{label:"Very long (2000)",v:2000}].map(p => (
                    <option key={p.v} value={p.v}>{p.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">System prompt (optional)</label>
                <Textarea className="w-full" rows={3} placeholder="Instructions that guide the AI's behavior" value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Expected output type</label>
                <Select className="w-full" value={expectedType} onChange={(e) => setExpectedType(e.target.value)}>
                  {["Explanation","Code","List","JSON","Creative writing","Analysis"].map((t) => <option key={t}>{t}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Expected length</label>
                <Select className="w-full" value={expectedLength} onChange={(e) => setExpectedLength(e.target.value)}>
                  {["Brief (< 100 words)","Standard (100-500)","Long (500-1000)","Very long (1000+)"] .map((t) => <option key={t}>{t}</option>)}
                </Select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Known issues (optional)</label>
              <div className="flex flex-wrap gap-2">
                {["Too verbose","Misses key points","Inconsistent format","Wrong tone","Hallucinations"].map((i) => {
                  const active = knownIssues.includes(i);
                  return (
                    <button key={i} type="button" onClick={() => setKnownIssues((arr) => (arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]))}
                      className={"rounded-md border px-2 py-1 text-xs transition-colors " + (active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-secondary/20 border-border")}
                    >{active && <span className="mr-1">✓</span>}{i}</button>
                  );
                })}
              </div>
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
                  <Badge variant="secondary">{confidence}%</Badge>
                </div>
                <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-secondary/40" role="progressbar" aria-valuenow={Number(confidence || 0)} aria-valuemin={0} aria-valuemax={100} aria-label="Confidence meter">
                  <div className={`h-3 ${confidenceColor}`} style={{ width: `${Number(confidence || 0)}%` }} />
                </div>
              </div>

              {/* Predicted output as chat bubble */}
              <div>
                <div className="text-sm font-medium">Predicted Output</div>
                <div className="mt-2 rounded-2xl border border-border bg-secondary/10 p-3">
                  <ChatBubble>{typeof prediction.predictedOutput === 'string' ? prediction.predictedOutput : prediction.predictedOutput?.predictedOutput || "No output predicted"}</ChatBubble>
                  <div className="mt-2 flex justify-end">
                    <Button variant="outline" size="sm" onClick={async () => { try { await navigator.clipboard.writeText(typeof prediction.predictedOutput === 'string' ? prediction.predictedOutput : prediction.predictedOutput?.predictedOutput || ""); } catch {} }} className="shadow-sm hover:shadow-md">Copy</Button>
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <div className="text-sm font-medium">Why the AI will respond this way</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground/70">
                  {(() => {
                    const reasoning = typeof prediction.predictedOutput === 'object' && prediction.predictedOutput?.reasoning 
                      ? prediction.predictedOutput.reasoning 
                      : prediction.reasoning;
                    return reasoning ? reasoning.split(/\n+/).map((line: string, idx: number) => (
                      <li key={idx}>{line}</li>
                    )) : (
                      <li>No reasoning provided</li>
                    );
                  })()}
                </ul>
              </div>

              {/* Warnings */}
              {(() => {
                const warnings = typeof prediction.predictedOutput === 'object' && prediction.predictedOutput?.warnings 
                  ? prediction.predictedOutput.warnings 
                  : prediction.warnings;
                return !!warnings?.length && (
                  <div>
                    <div className="text-sm font-medium">Warnings</div>
                    <div className="mt-2 space-y-2">
                      {warnings.map((w: string, i: number) => (
                        <AlertItem key={i} text={w} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Alternatives */}
              {(() => {
                const alternatives = typeof prediction.predictedOutput === 'object' && prediction.predictedOutput?.alternatives 
                  ? prediction.predictedOutput.alternatives 
                  : prediction.alternatives;
                return !!alternatives?.length && (
                  <div>
                    <div className="text-sm font-medium">Alternative Suggestions</div>
                    <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {alternatives.map((a: { modifiedPrompt: string; expectedChange: string }, i: number) => (
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
                );
              })()}
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
