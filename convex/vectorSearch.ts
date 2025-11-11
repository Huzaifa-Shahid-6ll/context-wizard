import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Generate embedding using OpenRouter's embedding endpoint (must be in action)
export const generateEmbedding = action({
  args: { text: v.string() },
  handler: async (_ctx, { text }): Promise<number[]> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Context Wizard",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small", // Cost-effective embedding model
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error("Error generating embedding:", error);
      throw error;
    }
  },
});

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Store embedding in database
export const storeEmbedding = action({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    content: v.string(),
    metadata: v.object({
      type: v.union(
        v.literal("form_data"),
        v.literal("prd"),
        v.literal("user_flow"),
        v.literal("task"),
        v.literal("frontend_prompt"),
        v.literal("backend_prompt"),
        v.literal("security_prompt"),
        v.literal("functionality_prompt"),
        v.literal("error_fixing_prompt"),
        v.literal("chat_message")
      ),
      section: v.optional(v.string()),
      promptId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { sessionId, userId, content, metadata }) => {
    // Generate embedding
    const embedding = await ctx.runAction(api.vectorSearch.generateEmbedding, { text: content });

    // Store in database
    await ctx.runMutation(api.vectorSearch.insertEmbedding, {
      sessionId,
      userId,
      content,
      embedding,
      metadata,
    });
  },
});

// Internal mutation to insert embedding
export const insertEmbedding = mutation({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    content: v.string(),
    embedding: v.array(v.number()),
    metadata: v.object({
      type: v.union(
        v.literal("form_data"),
        v.literal("prd"),
        v.literal("user_flow"),
        v.literal("task"),
        v.literal("frontend_prompt"),
        v.literal("backend_prompt"),
        v.literal("security_prompt"),
        v.literal("functionality_prompt"),
        v.literal("error_fixing_prompt"),
        v.literal("chat_message")
      ),
      section: v.optional(v.string()),
      promptId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("vectorEmbeddings", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Search for similar content (vector similarity search) - must be action due to embedding generation
export const searchSimilar = action({
  args: {
    sessionId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, query: searchQuery, limit = 10 }): Promise<Array<{
    _id: any;
    _creationTime: number;
    sessionId: string;
    userId: string;
    content: string;
    metadata: {
      type: string;
      section?: string;
      promptId?: string;
    };
    createdAt: number;
    similarity: number;
  }>> => {
    // Generate embedding for search query
    const queryEmbedding = await ctx.runAction(api.vectorSearch.generateEmbedding, { text: searchQuery });

    // Get all embeddings for this session
    const embeddings: Array<{
      _id: any;
      _creationTime: number;
      sessionId: string;
      userId: string;
      content: string;
      embedding: number[];
      metadata: {
        type: string;
        section?: string;
        promptId?: string;
      };
      createdAt: number;
    }> = await ctx.runQuery(api.vectorSearch.getEmbeddingsForSession, {
      sessionId: String(sessionId),
    });

    // Calculate similarities
    const similarities: Array<{
      _id: any;
      _creationTime: number;
      sessionId: string;
      userId: string;
      content: string;
      embedding: number[];
      metadata: {
        type: string;
        section?: string;
        promptId?: string;
      };
      createdAt: number;
      similarity: number;
    }> = embeddings.map((emb: {
      _id: any;
      _creationTime: number;
      sessionId: string;
      userId: string;
      content: string;
      embedding: number[];
      metadata: {
        type: string;
        section?: string;
        promptId?: string;
      };
      createdAt: number;
    }) => ({
      ...emb,
      similarity: cosineSimilarity(queryEmbedding, emb.embedding),
    }));

    // Sort by similarity and return top results
    const sorted = similarities
      .sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity)
      .slice(0, limit);
    
    // Remove embedding from response
    return sorted.map((item: {
      _id: any;
      _creationTime: number;
      sessionId: string;
      userId: string;
      content: string;
      embedding: number[];
      metadata: {
        type: string;
        section?: string;
        promptId?: string;
      };
      createdAt: number;
      similarity: number;
    }) => {
      const { embedding: _, ...rest } = item;
      return {
        _id: rest._id,
        _creationTime: rest._creationTime,
        sessionId: rest.sessionId,
        userId: rest.userId,
        content: rest.content,
        metadata: rest.metadata,
        createdAt: rest.createdAt,
        similarity: rest.similarity,
      };
    });
  },
});

// Helper query to get embeddings for a session
export const getEmbeddingsForSession = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("vectorEmbeddings")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
});

// Get relevant context for RAG
export const getRelevantContext = action({
  args: {
    sessionId: v.union(v.string(), v.id("chatSessions")),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { sessionId, query: searchQuery, limit = 10 }): Promise<Array<{
    _id: any;
    _creationTime: number;
    sessionId: string;
    userId: string;
    content: string;
    metadata: {
      type: string;
      section?: string;
      promptId?: string;
    };
    createdAt: number;
    similarity: number;
  }>> => {
    // Use vector search to find relevant context
    const results: Array<{
      _id: any;
      _creationTime: number;
      sessionId: string;
      userId: string;
      content: string;
      metadata: {
        type: string;
        section?: string;
        promptId?: string;
      };
      createdAt: number;
      similarity: number;
    }> = await ctx.runAction(api.vectorSearch.searchSimilar, {
      sessionId: String(sessionId),
      query: searchQuery,
      limit,
    });

    return results;
  },
});

// Batch store embeddings (for initial context setup)
export const batchStoreEmbeddings = action({
  args: {
    sessionId: v.string(),
    userId: v.string(),
    items: v.array(
      v.object({
        content: v.string(),
        metadata: v.object({
          type: v.union(
            v.literal("form_data"),
            v.literal("prd"),
            v.literal("user_flow"),
            v.literal("task"),
            v.literal("frontend_prompt"),
            v.literal("backend_prompt"),
            v.literal("security_prompt"),
            v.literal("functionality_prompt"),
            v.literal("error_fixing_prompt"),
            v.literal("chat_message")
          ),
          section: v.optional(v.string()),
          promptId: v.optional(v.string()),
        }),
      })
    ),
  },
  handler: async (ctx, { sessionId, userId, items }) => {
    // Store each embedding
    for (const item of items) {
      await ctx.runAction(api.vectorSearch.storeEmbedding, {
        sessionId,
        userId,
        content: item.content,
        metadata: item.metadata,
      });
    }

    return { stored: items.length };
  },
});

