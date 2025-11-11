import { query } from "./_generated/server";
import { v } from "convex/values";

// Get a single chat session
export const getChatSession = query({
  args: { sessionId: v.union(v.string(), v.id("chatSessions")) },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db.get(sessionId as any);
  },
});

// Get all user's chat sessions
export const getUserChatSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Search chat sessions by title/content
export const searchChatSessions = query({
  args: {
    userId: v.string(),
    query: v.string(),
  },
  handler: async (ctx, { userId, query: searchQuery }) => {
    const allSessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const lowerQuery = searchQuery.toLowerCase();
    return allSessions.filter((session) => {
      const titleMatch = session.title.toLowerCase().includes(lowerQuery);
      const contentMatch = session.messages.some((msg: any) =>
        msg.content.toLowerCase().includes(lowerQuery)
      );
      return titleMatch || contentMatch;
    });
  },
});

// Get chat history for a session
export const getChatHistory = query({
  args: { sessionId: v.union(v.string(), v.id("chatSessions")) },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId as any) as any;
    if (!session || !("messages" in session)) return null;

    // Return last 20 messages with summarization note if more exist
    const messages = session.messages || [];
    const last20 = messages.slice(-20);
    const hasMore = messages.length > 20;

    return {
      messages: last20,
      hasMore,
      totalMessages: messages.length,
    };
  },
});

// Get full context for a session
export const getContextForSession = query({
  args: { sessionId: v.union(v.string(), v.id("chatSessions")) },
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId as any) as any;
    if (!session || !("context" in session)) return null;

    return {
      context: session.context,
      projectName: session.projectName,
      generationId: session.generationId,
    };
  },
});

