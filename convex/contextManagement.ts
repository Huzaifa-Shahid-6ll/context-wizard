import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Context Memory Management Functions

export const storeContext = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    contextType: v.union(
      v.literal("conversation"),
      v.literal("project"),
      v.literal("domain"),
      v.literal("preference")
    ),
    content: v.string(),
    metadata: v.optional(v.any()),
    importance: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("contextMemory", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getContextBySession = query({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    contextType: v.optional(v.union(
      v.literal("conversation"),
      v.literal("project"),
      v.literal("domain"),
      v.literal("preference")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, sessionId, contextType, limit = 50 }) => {
    let query = ctx.db
      .query("contextMemory")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .filter((q) => q.eq(q.field("userId"), userId));

    if (contextType) {
      query = query.filter((q) => q.eq(q.field("contextType"), contextType));
    }

    const results = await query
      .order("desc")
      .take(limit);

    // Filter out expired contexts
    const now = Date.now();
    return results.filter(context => 
      !context.expiresAt || context.expiresAt > now
    );
  },
});

export const getRelevantContext = query({
  args: {
    userId: v.string(),
    query: v.string(),
    contextTypes: v.optional(v.array(v.union(
      v.literal("conversation"),
      v.literal("project"),
      v.literal("domain"),
      v.literal("preference")
    ))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, query: searchQuery, contextTypes, limit = 20 }) => {
    let queryBuilder = ctx.db
      .query("contextMemory")
      .withIndex("by_userId", (q) => q.eq("userId", userId));

    if (contextTypes && contextTypes.length > 0) {
      queryBuilder = queryBuilder.filter((q) => 
        q.or(...contextTypes.map(type => q.eq(q.field("contextType"), type)))
      );
    }

    const results = await queryBuilder
      .order("desc")
      .take(limit * 2); // Get more to filter by relevance

    // Simple relevance scoring based on content matching
    const scoredResults = results.map(context => {
      const contentLower = context.content.toLowerCase();
      const queryLower = searchQuery.toLowerCase();
      const words = queryLower.split(' ');
      
      let score = 0;
      words.forEach(word => {
        if (contentLower.includes(word)) {
          score += 1;
        }
      });
      
      // Boost score for importance
      if (context.importance === "high") score += 3;
      else if (context.importance === "medium") score += 2;
      else score += 1;

      return { ...context, relevanceScore: score };
    });

    // Sort by relevance and return top results
    return scoredResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  },
});

export const updateContext = mutation({
  args: {
    contextId: v.id("contextMemory"),
    content: v.optional(v.string()),
    metadata: v.optional(v.any()),
    importance: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { contextId, ...updates }) => {
    const now = Date.now();
    return await ctx.db.patch(contextId, {
      ...updates,
      updatedAt: now,
    });
  },
});

export const deleteContext = mutation({
  args: {
    contextId: v.id("contextMemory"),
  },
  handler: async (ctx, { contextId }) => {
    return await ctx.db.delete(contextId);
  },
});

export const cleanupExpiredContext = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredContexts = await ctx.db
      .query("contextMemory")
      .filter((q) => q.and(
        q.neq(q.field("expiresAt"), undefined),
        q.lt(q.field("expiresAt"), now)
      ))
      .collect();

    const deletePromises = expiredContexts.map(context => 
      ctx.db.delete(context._id)
    );

    await Promise.all(deletePromises);
    return expiredContexts.length;
  },
});

// Prompt Templates Management

export const createTemplate = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("generic"),
      v.literal("image"),
      v.literal("video"),
      v.literal("cursor-app"),
      v.literal("analysis")
    ),
    template: v.string(),
    variables: v.array(v.string()),
    metadata: v.optional(v.any()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("promptTemplates", {
      ...args,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getTemplates = query({
  args: {
    userId: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("generic"),
      v.literal("image"),
      v.literal("video"),
      v.literal("cursor-app"),
      v.literal("analysis")
    )),
    includePublic: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, category, includePublic = true, limit = 50 }) => {
    let query;

    if (userId) {
      query = ctx.db
        .query("promptTemplates")
        .withIndex("by_userId", (q) => q.eq("userId", userId));
    } else if (includePublic) {
      query = ctx.db
        .query("promptTemplates")
        .withIndex("by_isPublic", (q) => q.eq("isPublic", true));
    } else {
      query = ctx.db.query("promptTemplates");
    }

    if (category) {
      query = query.filter((q) => q.eq(q.field("category"), category));
    }

    return await query
      .order("desc")
      .take(limit);
  },
});

export const getTemplate = query({
  args: {
    templateId: v.id("promptTemplates"),
  },
  handler: async (ctx, { templateId }) => {
    return await ctx.db.get(templateId);
  },
});

export const useTemplate = mutation({
  args: {
    templateId: v.id("promptTemplates"),
  },
  handler: async (ctx, { templateId }) => {
    const template = await ctx.db.get(templateId);
    if (!template) return null;

    return await ctx.db.patch(templateId, {
      usageCount: template.usageCount + 1,
      updatedAt: Date.now(),
    });
  },
});

export const updateTemplate = mutation({
  args: {
    templateId: v.id("promptTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    template: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, { templateId, ...updates }) => {
    const now = Date.now();
    return await ctx.db.patch(templateId, {
      ...updates,
      updatedAt: now,
    });
  },
});

export const deleteTemplate = mutation({
  args: {
    templateId: v.id("promptTemplates"),
  },
  handler: async (ctx, { templateId }) => {
    return await ctx.db.delete(templateId);
  },
});

// Advanced Context Engineering Functions

export const generateContextualPrompt = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    basePrompt: v.string(),
    contextTypes: v.optional(v.array(v.union(
      v.literal("conversation"),
      v.literal("project"),
      v.literal("domain"),
      v.literal("preference")
    ))),
    maxContextLength: v.optional(v.number()),
  },
  handler: async (ctx, { userId, sessionId, basePrompt, contextTypes, maxContextLength = 2000 }) => {
    // Get relevant context
    const relevantContext = await ctx.runQuery(api.contextManagement.getRelevantContext, {
      userId,
      query: basePrompt,
      contextTypes,
      limit: 10,
    });

    // Build contextual prompt using 6-part framework
    let contextualPrompt = `<user_query>
${basePrompt}
</user_query>

<context>
`;

    let contextLength = 0;
    for (const context of relevantContext) {
      const contextText = `[${context.contextType.toUpperCase()}] ${context.content}\n`;
      if (contextLength + contextText.length > maxContextLength) break;
      
      contextualPrompt += contextText;
      contextLength += contextText.length;
    }

    contextualPrompt += `</context>

<task>
Apply the 6-part prompting framework with the provided context:
1. **COMMAND**: Start with strong, direct action verbs
2. **CONTEXT**: Use the rich background information provided
3. **LOGIC**: Define clear output structure and reasoning
4. **ROLEPLAY**: Assign expert persona with domain knowledge
5. **FORMATTING**: Specify precise output format
6. **QUESTIONS**: Include follow-up questions for refinement
</task>

<output_format>
Return optimized prompt following context engineering best practices
</output_format>`;

    return contextualPrompt;
  },
});

export const storePromptSession = mutation({
  args: {
    userId: v.string(),
    sessionId: v.string(),
    promptType: v.string(),
    originalPrompt: v.string(),
    optimizedPrompt: v.string(),
    context: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Store the session context
    await ctx.db.insert("contextMemory", {
      userId: args.userId,
      sessionId: args.sessionId,
      contextType: "conversation",
      content: `Prompt Type: ${args.promptType}\nOriginal: ${args.originalPrompt}\nOptimized: ${args.optimizedPrompt}`,
      metadata: {
        promptType: args.promptType,
        originalPrompt: args.originalPrompt,
        optimizedPrompt: args.optimizedPrompt,
        context: args.context,
        ...args.metadata,
      },
      importance: "medium",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true };
  },
});
