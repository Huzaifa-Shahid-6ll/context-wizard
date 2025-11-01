import { api } from "@/../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

interface AutofillSuggestion {
  field: string;
  value: unknown;
  confidence: number;
  source: 'previous_inputs' | 'similar_projects' | 'ai_suggestion' | 'template';
}

interface AutofillContext {
  userId: string;
  featureType: string;
  currentInputs: Record<string, unknown>;
  similarProjects?: string[];
}

export type AutofillEntry = {
  featureType: string;
  fields: Record<string, unknown>;
  timestamp: number;
};

function getHistoryKey(featureType: string, userId?: string) {
  return `autofill-history:${featureType}${userId ? ':' + userId : ''}`;
}

// Get recent values for a featureType/user
export function getSmartDefaults(featureType: string, userId?: string): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(getHistoryKey(featureType, userId));
    if (!raw) return null;
    const arr: AutofillEntry[] = JSON.parse(raw);
    // Use most recent complete entry
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr.sort((a, b) => b.timestamp - a.timestamp)[0].fields;
  } catch {
    return null;
  }
}

// Suggest values given current input (for now, just use the latest similar entry)
export function suggestFields(
  featureType: string,
  currentState: Record<string, unknown>,
  userId?: string
): Partial<Record<string, unknown>> {
  // In future, use ML or more complex heuristics
  const defaults = getSmartDefaults(featureType, userId);
  if (!defaults) return {};
  // Only suggest fields not already filled
  const suggest: Record<string, unknown> = {};
  for (const k in defaults) {
    if (!currentState[k]) suggest[k] = defaults[k];
  }
  return suggest;
}

// Record a submission into autofill store
export function recordSubmission(featureType: string, fields: Record<string, unknown>, userId?: string) {
  try {
    const key = getHistoryKey(featureType, userId);
    let arr: AutofillEntry[] = [];
    const old = localStorage.getItem(key);
    if (old) {
      arr = JSON.parse(old);
      if (!Array.isArray(arr)) arr = [];
    }
    arr.unshift({ featureType, fields, timestamp: Date.now() });
    if (arr.length > 10) arr.length = 10; // limit history for quick scan
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

export class AutofillService {
  private convex: ConvexHttpClient;

  constructor(convex: ConvexHttpClient) {
    this.convex = convex;
  }

  async getSuggestions(context: AutofillContext): Promise<AutofillSuggestion[]> {
    const suggestions: AutofillSuggestion[] = [];

    // Get suggestions from previous inputs
    const previousInputs = await this.getPreviousInputs(context.userId, context.featureType);
    suggestions.push(...this.generateSuggestionsFromHistory(previousInputs, context.currentInputs));

    // Get suggestions from similar projects
    if (context.similarProjects) {
      const similarProjectData = await this.getSimilarProjectData(context.similarProjects);
      suggestions.push(...this.generateSuggestionsFromSimilarProjects(similarProjectData, context.currentInputs));
    }

    // Get AI-powered suggestions
    const aiSuggestions = await this.getAISuggestions(context);
    suggestions.push(...aiSuggestions);

    // Get template suggestions
    const templateSuggestions = await this.getTemplateSuggestions(context.featureType, context.currentInputs);
    suggestions.push(...templateSuggestions);

    // Sort by confidence and remove duplicates
    return this.deduplicateAndSort(suggestions);
  }

  private async getPreviousInputs(userId: string, featureType: string): Promise<unknown[]> {
    try {
      return await this.convex.query(api.queries.getUserPreferences, {
        userId,
        featureType
      });
    } catch (error) {
      console.error('Error fetching previous inputs:', error);
      return [];
    }
  }

  private async getSimilarProjectData(projectIds: string[]): Promise<unknown[]> {
    try {
      return await this.convex.query(api.queries.getSimilarProjects, {
        projectIds
      });
    } catch (error) {
      console.error('Error fetching similar project data:', error);
      return [];
    }
  }

  private generateSuggestionsFromHistory(
    previousInputs: unknown[], 
    currentInputs: Record<string, unknown>
  ): AutofillSuggestion[] {
    const suggestions: AutofillSuggestion[] = [];
    
    // Find patterns in previous inputs
    const fieldPatterns = this.analyzeFieldPatterns(previousInputs);
    
    for (const [field, pattern] of Object.entries(fieldPatterns)) {
      if (!currentInputs[field] && pattern.mostCommon) {
        suggestions.push({
          field,
          value: pattern.mostCommon,
          confidence: pattern.frequency / previousInputs.length,
          source: 'previous_inputs'
        });
      }
    }

    return suggestions;
  }

  private generateSuggestionsFromSimilarProjects(
    similarProjects: unknown[], 
    currentInputs: Record<string, unknown>
  ): AutofillSuggestion[] {
    const suggestions: AutofillSuggestion[] = [];
    
    // Analyze similar projects for common patterns
    const commonPatterns = this.findCommonPatterns(similarProjects);
    
    for (const [field, value] of Object.entries(commonPatterns)) {
      if (!currentInputs[field]) {
        suggestions.push({
          field,
          value,
          confidence: 0.7, // Medium confidence for similar projects
          source: 'similar_projects'
        });
      }
    }

    return suggestions;
  }

  private async getAISuggestions(context: AutofillContext): Promise<AutofillSuggestion[]> {
    try {
      // Use AI to analyze current inputs and suggest completions
      const prompt = this.buildAISuggestionPrompt(context);
      
      const response = await this.convex.action(api.actions.generateAISuggestions, {
        prompt,
        context: context.currentInputs
      });

      return response.suggestions || [];
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  }

  private async getTemplateSuggestions(
    featureType: string, 
    currentInputs: Record<string, unknown>
  ): Promise<AutofillSuggestion[]> {
    try {
      const templates = await this.convex.query(api.queries.getTemplatesByFeature, {
        featureType
      });

      const suggestions: AutofillSuggestion[] = [];
      
      for (const template of templates) {
        for (const field of template.fields) {
          if (!currentInputs[field.fieldName] && field.defaultValue) {
            suggestions.push({
              field: field.fieldName,
              value: field.defaultValue,
              confidence: 0.6, // Medium confidence for templates
              source: 'template'
            });
          }
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting template suggestions:', error);
      return [];
    }
  }

  private analyzeFieldPatterns(inputs: unknown[]): Record<string, { mostCommon: unknown; frequency: number }> {
    const patterns: Record<string, Record<string, number>> = {};
    
    for (const input of inputs) {
      if (typeof input !== 'object' || input === null) continue;
      for (const [field, value] of Object.entries(input)) {
        if (!patterns[field]) {
          patterns[field] = {};
        }
        
        const valueKey = String(value);
        patterns[field][valueKey] = (patterns[field][valueKey] || 0) + 1;
      }
    }

    const result: Record<string, { mostCommon: unknown; frequency: number }> = {};
    
    for (const [field, values] of Object.entries(patterns)) {
      const sortedValues = Object.entries(values).sort(([,a], [,b]) => b - a);
      if (sortedValues.length > 0) {
        result[field] = {
          mostCommon: sortedValues[0][0],
          frequency: sortedValues[0][1]
        };
      }
    }

    return result;
  }

  private findCommonPatterns(projects: unknown[]): Record<string, unknown> {
    const patterns: Record<string, unknown> = {};
    
    // Simple pattern matching - in a real implementation, this would be more sophisticated
    for (const project of projects) {
      if (typeof project !== 'object' || project === null) continue;
      for (const [field, value] of Object.entries(project)) {
        if (!patterns[field]) {
          patterns[field] = value;
        }
      }
    }

    return patterns;
  }

  private buildAISuggestionPrompt(context: AutofillContext): string {
    return `
Analyze the following form inputs and suggest completions for missing fields:

Current inputs: ${JSON.stringify(context.currentInputs)}
Feature type: ${context.featureType}

Based on the current inputs, suggest appropriate values for common missing fields.
Return suggestions in this format:
{
  "suggestions": [
    {
      "field": "fieldName",
      "value": "suggestedValue",
      "confidence": 0.8,
      "reasoning": "explanation"
    }
  ]
}
`;
  }

  private deduplicateAndSort(suggestions: AutofillSuggestion[]): AutofillSuggestion[] {
    // Remove duplicates based on field and value
    const unique = suggestions.reduce((acc, suggestion) => {
      const key = `${suggestion.field}:${JSON.stringify(suggestion.value)}`;
      if (!acc.has(key)) {
        acc.set(key, suggestion);
      } else {
        // Keep the one with higher confidence
        const existing = acc.get(key)!;
        if (suggestion.confidence > existing.confidence) {
          acc.set(key, suggestion);
        }
      }
      return acc;
    }, new Map<string, AutofillSuggestion>());

    // Sort by confidence (highest first)
    return Array.from(unique.values()).sort((a, b) => b.confidence - a.confidence);
  }

  async saveUserInput(userId: string, featureType: string, formData: Record<string, unknown>): Promise<void> {
    try {
      await this.convex.mutation(api.mutations.saveUserPreferences, {
        userId,
        featureType,
        formData
      });
    } catch (error) {
      console.error('Error saving user input:', error);
    }
  }

  async getAutoFillData(userId: string, featureType: string): Promise<Record<string, unknown>> {
    try {
      const preferences = await this.convex.query(api.queries.getUserPreferences, {
        userId,
        featureType
      });
      
      return preferences?.savedInputs || {};
    } catch (error) {
      console.error('Error getting autofill data:', error);
      return {};
    }
  }
}

// Factory function to create autofill service
export function createAutofillService(convex: ConvexHttpClient): AutofillService {
  return new AutofillService(convex);
}
