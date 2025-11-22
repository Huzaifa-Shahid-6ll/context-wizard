import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a prompt template by slug (slug is derived from name)
export const getTemplate = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        // Query all templates and filter by slug (slug is derived from name)
        const templates = await ctx.db
            .query("promptTemplates")
            .collect();
        // Find template where slug matches (slug is typically name.toLowerCase().replace(/\s+/g, '-'))
        const template = templates.find(t => {
            const templateSlug = (t as any).name?.toLowerCase().replace(/\s+/g, '-') || '';
            return templateSlug === slug;
        });
        return template || null;
    },
});

// Create or update a prompt template
export const saveTemplate = mutation({
    args: {
        slug: v.string(),
        template: v.string(),
        description: v.optional(v.string()),
        version: v.number(),
    },
    handler: async (ctx, { slug, template, description, version }) => {
        // Query all templates and find by slug (slug derived from name)
        const templates = await ctx.db
            .query("promptTemplates")
            .collect();
        const existing = templates.find(t => {
            const templateSlug = (t as any).name?.toLowerCase().replace(/\s+/g, '-') || '';
            return templateSlug === slug;
        });

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                template,
                description: description || existing.description,
                updatedAt: now,
            });
        } else {
            // Create new template - slug is used to derive name
            const name = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            await ctx.db.insert("promptTemplates", {
                userId: "system", // System template
                name,
                description: description || "",
                category: "generic",
                template,
                variables: [],
                metadata: { version },
                isPublic: true,
                usageCount: 0,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});

// Helper to get a template or fallback to a default
// This is not an exposed query, but a helper for internal use if we were to move logic here.
// However, since we can't export non-convex functions easily for use in actions without making them internal,
// we'll rely on the `getTemplate` query or just fetch it in the action.
