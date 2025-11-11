"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Send, Save, X, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const sessionId = params.sessionId as string;

  const session = useQuery(api.chatQueries.getChatSession, sessionId ? { sessionId: sessionId as any } : "skip");
  const chatHistory = useQuery(api.chatQueries.getChatHistory, sessionId ? { sessionId: sessionId as any } : "skip");
  const context = useQuery(api.chatQueries.getContextForSession, sessionId ? { sessionId: sessionId as any } : "skip");

  const sendMessage = useAction(api.chatMutations.sendMessage);
  const updateContext = useMutation(api.chatMutations.updateContext);

  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [contextCollapsed, setContextCollapsed] = React.useState(false);
  const [editingContext, setEditingContext] = React.useState<string | null>(null);
  const [editedContext, setEditedContext] = React.useState<any>(null);

  React.useEffect(() => {
    if (context) {
      setEditedContext(context.context);
    }
  }, [context]);

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;

    setIsLoading(true);
    try {
      await sendMessage({
        sessionId: sessionId as any,
        userId: user.id,
        message: message.trim(),
      });
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContext = async () => {
    if (!sessionId || !user?.id || !editedContext) return;

    try {
      await updateContext({
        sessionId: sessionId as any,
        userId: user.id,
        context: editedContext,
      });
      toast.success("Context updated");
      setEditingContext(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update context");
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-foreground/60">Loading chat...</p>
        </div>
      </div>
    );
  }

  const messages = chatHistory?.messages || [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Context Panel (Left) */}
      <div
        className={`${
          contextCollapsed ? "w-0" : "w-80"
        } border-r border-border bg-secondary/10 transition-all duration-300 overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Context</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setContextCollapsed(!contextCollapsed)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {editedContext && (
              <>
                <div>
                  <Label>Form Data</Label>
                  <Textarea
                    value={JSON.stringify(editedContext.formData || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        setEditedContext({
                          ...editedContext,
                          formData: JSON.parse(e.target.value),
                        });
                      } catch {}
                    }}
                    className="mt-2 font-mono text-xs"
                    rows={6}
                  />
                </div>

                {editedContext.prd && (
                  <div>
                    <Label>PRD</Label>
                    <Textarea
                      value={editedContext.prd}
                      onChange={(e) =>
                        setEditedContext({ ...editedContext, prd: e.target.value })
                      }
                      className="mt-2 text-sm"
                      rows={8}
                    />
                  </div>
                )}

                {editedContext.userFlows && (
                  <div>
                    <Label>User Flows</Label>
                    <Textarea
                      value={editedContext.userFlows}
                      onChange={(e) =>
                        setEditedContext({ ...editedContext, userFlows: e.target.value })
                      }
                      className="mt-2 text-sm"
                      rows={8}
                    />
                  </div>
                )}

                {editedContext.taskFile && (
                  <div>
                    <Label>Tasks</Label>
                    <Textarea
                      value={editedContext.taskFile}
                      onChange={(e) =>
                        setEditedContext({ ...editedContext, taskFile: e.target.value })
                      }
                      className="mt-2 text-sm"
                      rows={8}
                    />
                  </div>
                )}

                {editedContext.generatedPrompts && (
                  <div>
                    <Label>Generated Prompts</Label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(editedContext.generatedPrompts).map(([type, prompts]: [string, any]) => (
                        <div key={type} className="border border-border rounded p-2">
                          <div className="font-medium text-xs mb-1">{type}</div>
                          {Array.isArray(prompts) &&
                            prompts.map((prompt: any, idx: number) => (
                              <div key={idx} className="text-xs text-foreground/70 mb-1">
                                {prompt.title || `Prompt ${idx + 1}`}
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button onClick={handleSaveContext} className="w-full" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Context
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Panel (Right) */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold">{session.title}</h1>
            <p className="text-xs text-foreground/60">{session.projectName}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-foreground/60 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation about your project</p>
              <p className="text-sm mt-2">Ask questions, modify prompts, or add new features</p>
            </div>
          )}

          {messages.map((msg: any, idx: number) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[80%] p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </Card>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-secondary p-3">
                <p className="text-sm">Thinking...</p>
              </Card>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message... (Use / for commands)"
              className="min-h-[60px]"
            />
            <Button onClick={handleSend} disabled={!message.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-foreground/60 mt-2">
            Turns: {session.turnCount}/50 | Messages: {session.messageCount}/5
          </p>
        </div>
      </div>
    </div>
  );
}

