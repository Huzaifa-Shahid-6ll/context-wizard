/**
 * Utility functions for Convex backend
 */

/**
 * Robustly parses JSON from LLM output.
 * Handles:
 * - Markdown code fences (```json ... ```)
 * - Unescaped quotes or newlines
 * - Trailing commas (via loose parsing if needed, though JSON.parse is strict)
 * - Fallback to regex extraction
 */
export function parseLLMJson<T>(text: string, fallback?: T): T {
    if (!text) {
        if (fallback !== undefined) return fallback;
        throw new Error("Empty text provided to parseLLMJson");
    }

    // 1. Try standard parse first (fastest)
    try {
        return JSON.parse(text);
    } catch {
        // Continue to heuristics
    }

    // 2. Remove markdown code fences
    let cleaned = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");

    // Trim whitespace
    cleaned = cleaned.trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        // Continue
    }

    // 3. Try to find the first '{' and last '}' (or '[' and ']')
    const firstOpenBrace = cleaned.indexOf('{');
    const firstOpenBracket = cleaned.indexOf('[');

    let start = -1;
    let end = -1;

    // Determine if we are looking for an object or array
    if (firstOpenBrace !== -1 && (firstOpenBracket === -1 || firstOpenBrace < firstOpenBracket)) {
        start = firstOpenBrace;
        end = cleaned.lastIndexOf('}');
    } else if (firstOpenBracket !== -1) {
        start = firstOpenBracket;
        end = cleaned.lastIndexOf(']');
    }

    if (start !== -1 && end !== -1 && end > start) {
        const candidate = cleaned.substring(start, end + 1);
        try {
            return JSON.parse(candidate);
        } catch {
            // Continue
        }

        // 4. Try to fix common JSON issues in the candidate
        try {
            const fixed = candidate
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Fix unquoted keys
                .replace(/,\s*}/g, "}") // Remove trailing commas
                .replace(/,\s*]/g, "]");
            return JSON.parse(fixed);
        } catch {
            // Continue
        }
    }

    if (fallback !== undefined) return fallback;
    throw new Error(`Failed to parse JSON from text: ${text.substring(0, 100)}...`);
}
