import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { parseGitHubUrl, fetchRepoStructure, fetchRepoMetadata } from "../src/lib/github";

export const processGeneration = action({
  args: { generationId: v.id("generations") },
  handler: async (ctx, { generationId }): Promise<void> => {
    // Load generation
    const generation = await ctx.runQuery(api.queries.getGeneration, { id: generationId });
    if (!generation) {
      throw new Error("Generation not found");
    }

    try {
      // Get repo info
      const { owner, repo } = parseGitHubUrl(generation.repoUrl);

      // Fetch structure & metadata
      const [structure, metadata] = await Promise.all([
        fetchRepoStructure(owner, repo),
        fetchRepoMetadata(owner, repo),
      ]);

      // Build simplified structure for prompt
      const simplified = structure.tree.map((i: { path: string; type: string }) => ({ path: i.path, type: i.type }));

      // Generate files via Anthropic (call another action)
      const files: { name: string; content: string }[] = await ctx.runAction(api.generate.generateContextFiles, {
        repoData: {
          repoStructure: simplified,
          techStack: metadata.techStack,
          packageJson: metadata.packageJson,
          readmeContent: metadata.readme,
        },
      });

      // Update generation
      await ctx.runMutation(api.mutations.updateGeneration, {
        id: generationId,
        patch: {
          status: "completed",
          files,
          techStack: metadata.techStack,
          repoName: repo,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("processGeneration error", message);
      await ctx.runMutation(api.mutations.updateGeneration, { id: generationId, patch: { status: "failed", errorMessage: message } });
      throw err;
    }
  },
});

export const previewGeneration = action({
  args: { repoUrl: v.string() },
  handler: async (_ctx, { repoUrl }): Promise<{ repoName: string; techStack: string[]; files: { name: string; content: string }[] }> => {
    try {
      const { owner, repo } = parseGitHubUrl(repoUrl);

      const [structure, metadata] = await Promise.all([
        fetchRepoStructure(owner, repo),
        fetchRepoMetadata(owner, repo),
      ]);

      const simplified = structure.tree.map((i: { path: string; type: string }) => ({ path: i.path, type: i.type }));

      const files: { name: string; content: string }[] = await _ctx.runAction(api.generate.generateContextFiles, {
        repoData: {
          repoStructure: simplified,
          techStack: metadata.techStack,
          packageJson: metadata.packageJson,
          readmeContent: metadata.readme,
        },
      });

      return {
        repoName: repo,
        techStack: metadata.techStack,
        files,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("previewGeneration error", message);
      throw new Error(message);
    }
  },
});


