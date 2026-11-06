import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

export const googleProvider = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export function getLanguageModel() {
  const provider = process.env.AI_PROVIDER || 'google';

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return openaiProvider('gpt-4o-mini');
  }

  // Use Google Gemini 3.5 Flash Lite (active, ultra-fast, structured outputs)
  return googleProvider('gemini-3.5-flash-lite');
}

