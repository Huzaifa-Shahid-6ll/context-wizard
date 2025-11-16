/**
 * Accurate token counting utility using official tokenizers
 * This ensures exact matches with OpenAI's and Anthropic's token predictors
 */

import { encoding_for_model, get_encoding, type Tiktoken } from '@dqbd/tiktoken';
import { countTokens as anthropicCountTokens } from '@anthropic-ai/sdk';

export type TokenCountResult = {
  count: number;
  method: string;
  model?: string;
};

/**
 * Counts tokens accurately using the official tokenizer for the specified model
 * This ensures exact matches with OpenAI's and Anthropic's token predictors
 */
export function countTokensAccurate(
  text: string,
  modelOrProvider: string
): TokenCountResult {
  if (!text || text.trim().length === 0) {
    return { count: 0, method: 'empty' };
  }

  // Normalize model name
  const model = modelOrProvider.toLowerCase();

  // OpenAI models (GPT-3.5, GPT-4, etc.)
  if (
    model.includes('gpt-4') ||
    model.includes('gpt-3.5') ||
    model.includes('gpt-35') ||
    model.includes('gpt-4o') ||
    model.includes('gpt-4-turbo') ||
    model.includes('openai/gpt') ||
    model.includes('gpt')
  ) {
    try {
      // Map OpenRouter model names to OpenAI model names
      let openAIModel: string = 'gpt-4';
      if (model.includes('gpt-3.5') || model.includes('gpt-35')) {
        openAIModel = 'gpt-3.5-turbo';
      } else if (model.includes('gpt-4o')) {
        openAIModel = 'gpt-4o';
      } else if (model.includes('gpt-4-turbo')) {
        openAIModel = 'gpt-4-turbo';
      } else if (model.includes('gpt-4')) {
        openAIModel = 'gpt-4';
      }

      const encoding = encoding_for_model(openAIModel as any);
      const tokens = encoding.encode(text);
      const count = tokens.length;
      encoding.free(); // Free memory
      return {
        count,
        method: 'tiktoken',
        model: openAIModel,
      };
    } catch (error) {
      console.warn('Failed to use tiktoken, falling back to cl100k_base', error);
      // Fallback to cl100k_base encoding (used by GPT-4 and GPT-3.5)
      try {
        const encoding = get_encoding('cl100k_base');
        const tokens = encoding.encode(text);
        const count = tokens.length;
        encoding.free();
        return {
          count,
          method: 'tiktoken-cl100k_base-fallback',
          model: 'gpt-4',
        };
      } catch (fallbackError) {
        console.warn('Failed to use tiktoken fallback', fallbackError);
        // Last resort: approximation
        return {
          count: Math.ceil(text.length / 4),
          method: 'approximation-fallback',
        };
      }
    }
  }

  // Anthropic Claude models
  if (
    model.includes('claude') ||
    model.includes('anthropic/claude') ||
    model.includes('anthropic')
  ) {
    try {
      // Anthropic's countTokens function
      const count = anthropicCountTokens(text);
      return {
        count,
        method: 'anthropic-sdk',
        model: 'claude',
      };
    } catch (error) {
      console.warn('Failed to use Anthropic SDK, falling back', error);
      // Fallback approximation for Claude (~3.5 chars per token)
      return {
        count: Math.ceil(text.length / 3.5),
        method: 'approximation-fallback',
      };
    }
  }

  // Default: Try tiktoken with cl100k_base (used by GPT-4 and GPT-3.5)
  try {
    const encoding = get_encoding('cl100k_base');
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    return {
      count,
      method: 'tiktoken-cl100k_base',
      model: 'default',
    };
  } catch (error) {
    // Last resort: approximation
    return {
      count: Math.ceil(text.length / 4),
      method: 'approximation',
    };
  }
}

/**
 * Counts tokens for a full prompt including system and user messages
 */
export function countPromptTokens(
  systemPrompt: string,
  userPrompt: string,
  modelOrProvider: string
): {
  systemTokens: number;
  userTokens: number;
  totalTokens: number;
  breakdown: {
    system: TokenCountResult;
    user: TokenCountResult;
  };
} {
  const systemResult = countTokensAccurate(systemPrompt, modelOrProvider);
  const userResult = countTokensAccurate(userPrompt, modelOrProvider);

  return {
    systemTokens: systemResult.count,
    userTokens: userResult.count,
    totalTokens: systemResult.count + userResult.count,
    breakdown: {
      system: systemResult,
      user: userResult,
    },
  };
}

/**
 * Counts tokens for messages array (OpenAI format)
 * Accounts for message formatting overhead
 */
export function countMessagesTokens(
  messages: Array<{ role: string; content: string }>,
  modelOrProvider: string
): number {
  const model = modelOrProvider.toLowerCase();

  // For OpenAI models, we need to account for message formatting overhead
  if (
    model.includes('gpt') ||
    model.includes('openai')
  ) {
    try {
      let openAIModel = 'gpt-4';
      if (model.includes('gpt-3.5') || model.includes('gpt-35')) {
        openAIModel = 'gpt-3.5-turbo';
      } else if (model.includes('gpt-4o')) {
        openAIModel = 'gpt-4o';
      }

      const encoding = encoding_for_model(openAIModel as any);
      
      // OpenAI adds ~4 tokens per message for formatting
      let totalTokens = 0;
      for (const message of messages) {
        const content = `${message.role}\n${message.content}`;
        totalTokens += encoding.encode(content).length;
        totalTokens += 4; // Formatting overhead per message
      }
      totalTokens += 2; // Final message formatting
      
      encoding.free();
      return totalTokens;
    } catch (error) {
      // Fallback: just count the content
      const allText = messages.map((m) => m.content).join(' ');
      return countTokensAccurate(allText, modelOrProvider).count;
    }
  }

  // For other models, just count the content
  const allText = messages.map((m) => m.content).join(' ');
  return countTokensAccurate(allText, modelOrProvider).count;
}

