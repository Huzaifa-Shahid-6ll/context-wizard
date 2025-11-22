"use node";

import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { generateWithOpenRouter } from "../src/lib/openrouter";

const MAX_TURNS_FREE = 50;
const MAX_MESSAGES_FREE = 5;
const MAX_CHATS_PER_DAY_FREE = 3;

// Helper to check if user is pro
async function getUserTier(ctx: any, userId: string): Promise<{ isPro: boolean; tier: "free" | "pro" }> {
  const user = await ctx.runQuery(api.queries.getUserByClerkId, { clerkId: userId });
  const isPro = user?.isPro === true;
  return { isPro, tier: isPro ? "pro" : "free" };
}

// Helper to check chat limits
async function checkChatLimits(ctx: any, userId: string): Promise<{ canChat: boolean; reason?: string }> {
  const { isPro } = await getUserTier(ctx, userId);

  if (isPro) {
    return { canChat: true };
  }

  // Check daily chat limit
  const today = new Date().toISOString().split('T')[0];
  const userChats = await ctx.runQuery(api.chatQueries.getUserChatSessions, { userId });
  const todayChats = userChats?.filter((chat: any) => {
    const chatDate = new Date(chat.createdAt).toISOString().split('T')[0];
    return chatDate === today;
  }) || [];

  if (todayChats.length >= MAX_CHATS_PER_DAY_FREE) {
    return { canChat: false, reason: `Daily chat limit reached. You can create ${MAX_CHATS_PER_DAY_FREE} chats per day.` };
  }

  return { canChat: true };
}

// Create a new chat session from a generation
export const createChatSession = mutation({
  args: {
    userId: v.string(),
    generationId: v.string(),
    projectName: v.string(),
    context: v.any(), // Flexible context structure (validated in handler)
  },
  handler: async (ctx, { userId, generationId, projectName, context }) => {
    const limits = await checkChatLimits(ctx, userId);
    if (!limits.canChat) {
      throw new Error(`LIMIT_EXCEEDED: ${limits.reason || "Chat limit reached"}`);
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("chatSessions", {
      userId,
      generationId,
      title: "New Chat", // Will be updated with first user message
      projectName,
      context,
      messages: [],
      turnCount: 0,
      messageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return sessionId;
  },
});

// Send a message and get AI response
export const sendMessage = action({
  args: {
    sessionId: v.union(v.string(), v.id("chatSessions")),
    userId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { sessionId, userId, message }) => {
    // Get session
    const session = await ctx.runQuery(api.chatQueries.getChatSession, { sessionId: sessionId as any }) as any;
    if (!session || !("userId" in session)) {
      throw new Error("RESOURCE_NOT_FOUND: Chat session not found");
    }

    if (session.userId !== userId) {
      throw new Error("UNAUTHORIZED: Not authorized to access this chat session");
    }

    // Check limits
    const { isPro } = await getUserTier(ctx, userId);

    if (!isPro) {
      // Check message limit per chat
      if (session.messageCount >= MAX_MESSAGES_FREE) {
        throw new Error(`LIMIT_EXCEEDED: Message limit reached. Free users can send ${MAX_MESSAGES_FREE} messages per chat.`);
      }

      // Check turn limit
      if (session.turnCount >= MAX_TURNS_FREE) {
        throw new Error(`LIMIT_EXCEEDED: Turn limit reached. Free users can have ${MAX_TURNS_FREE} turns per session.`);
      }
    }

    // Get relevant context via RAG
    const relevantContext = await ctx.runAction(api.vectorSearch.getRelevantContext, {
      sessionId: String(sessionId),
      query: message,
      limit: 10,
    });

    // Build system prompt with context
    const systemPrompt = `You are an expert developer assistant with full context of the project "${session.projectName}".

You have access to:
- Complete form data and project requirements
- PRD (Product Requirements Document)
- User flows
- Task breakdown
- All generated prompts (frontend, backend, security, functionality, error-fixing)

Your role:
1. Help users modify existing prompts
2. Add new features to the project
3. Answer questions about the project
4. Proactively suggest improvements
5. Ask follow-up questions when intent is unclear

When modifying prompts, show diffs of what changed.
When adding features, ask clarifying questions to fully understand requirements.

Relevant context from project:
${relevantContext.map((ctx: any) => `[${ctx.metadata.type}] ${ctx.content}`).join('\n\n')}

Current project context:
${JSON.stringify(session.context, null, 2)}`;

    // Get AI response
    const { tier } = await getUserTier(ctx, userId);
    const aiResponse = await generateWithOpenRouter(
      `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`,
      tier
    );

    const now = Date.now();

    // Update session with new messages
    await ctx.runMutation(api.chatMutations.addMessageToSession, {
      sessionId: sessionId as any,
      userMessage: message,
      aiMessage: aiResponse,
      timestamp: now,
    });

    // Store embeddings for RAG
    await ctx.runAction(api.vectorSearch.storeEmbedding, {
      sessionId: String(sessionId),
      userId,
      content: message,
      metadata: {
        type: "chat_message",
        section: undefined,
        promptId: undefined,
      },
    });

    await ctx.runAction(api.vectorSearch.storeEmbedding, {
      sessionId: String(sessionId),
      userId,
      content: aiResponse,
      metadata: {
        type: "chat_message",
        section: undefined,
        promptId: undefined,
      },
    });

    return { response: aiResponse };
  },
});

// Add message to session (internal mutation)
export const addMessageToSession = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    userMessage: v.string(),
    aiMessage: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, { sessionId, userMessage, aiMessage, timestamp }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");

    const updatedMessages = [
      ...session.messages,
      { role: "user" as const, content: userMessage, timestamp, metadata: undefined },
      { role: "assistant" as const, content: aiMessage, timestamp: timestamp + 1, metadata: undefined },
    ];

    // Update title from first user message if still default
    let title = session.title;
    if (title === "New Chat" && userMessage) {
      title = userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : "");
    }

    await ctx.db.patch(sessionId, {
      messages: updatedMessages,
      turnCount: session.turnCount + 1,
      messageCount: session.messageCount + 2,
      title,
      updatedAt: timestamp,
    });
  },
});

// Update context in left panel
export const updateContext = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.string(),
    context: v.any(), // Flexible context structure (validated in handler)
  },
  handler: async (ctx, { sessionId, userId, context }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== userId) throw new Error("Unauthorized");

    await ctx.db.patch(sessionId, {
      context,
      updatedAt: Date.now(),
    });

    // Re-store embeddings for updated context
    // This will be handled by a separate function that processes context updates
  },
});

// Regenerate all prompts from chat
export const regeneratePrompts = action({
  args: {
    sessionId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const session = await ctx.runQuery(api.chatQueries.getChatSession, { sessionId }) as any;
    if (!session || !("userId" in session)) throw new Error("Session not found");
    if (session.userId !== userId) throw new Error("Unauthorized");

    // Use the updated context to regenerate prompts
    // This will call the prompt generation functions with updated context
    // Implementation depends on how we want to regenerate

    return { success: true };
  },
});

// Clear chat UI (keep in database)
export const clearChat = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.string(),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== userId) throw new Error("Unauthorized");

    // Just mark as inactive, don't delete
    await ctx.db.patch(sessionId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Delete chat session
export const deleteChatSession = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    userId: v.string(),
  },
  handler: async (ctx, { sessionId, userId }) => {
    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("RESOURCE_NOT_FOUND: Chat session not found");
    }
    if (session.userId !== userId) {
      // Log unauthorized access attempt
      await ctx.db.insert("securityEvents", {
        type: "unauthorized_access",
        userId,
        ip: "unknown",
        fingerprint: "unknown",
        details: { action: "delete_chat_session", resourceId: sessionId, resourceType: "chatSession" },
        severity: "high",
        timestamp: Date.now(),
      });
      throw new Error("UNAUTHORIZED: Not authorized to delete this chat session");
    }

    // Log successful deletion
    await ctx.db.insert("securityEvents", {
      type: "data_modification",
      userId,
      ip: "unknown",
      fingerprint: "unknown",
      details: { action: "delete_chat_session", resourceId: sessionId, resourceType: "chatSession" },
      severity: "low",
      timestamp: Date.now(),
    });

    await ctx.db.delete(sessionId);
  },
});

