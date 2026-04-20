import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || 'dummy_key');

/** Prefer newer IDs; first successful model wins */
export const GEMINI_MODEL_CANDIDATES = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
];

/** OpenRouter free models for fallback */
export const FREE_MODELS = [
  'openrouter/free',
  'minimax/minimax-m2.5:free',
  'stepfun/step-3.5-flash:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'arcee-ai/trinity-large-preview:free',
  'google/gemma-3-27b-it:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-coder:free',
  'google/gemma-3-12b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
];

/** Utility to wait */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @typedef {Object} LlmCallParams
 * @property {string} systemInstruction - System prompt (persona)
 * @property {string} userPrompt - User prompt body
 * @property {string} [logPrefix] - Optional log prefix e.g. "[FX]". Default: "[llm]"
 */

/**
 * Generate content using Gemini models with internal fallback.
 * @param {LlmCallParams} params
 * @returns {Promise<string>}
 */
export async function generateWithGemini({ systemInstruction, userPrompt, logPrefix = '[llm]' }) {
  let lastErr;
  for (const modelId of GEMINI_MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelId,
        systemInstruction,
      });
      console.log(`${logPrefix} Generating with ${modelId}...`);
      const result = await model.generateContent(userPrompt);
      const text = result.response.text();
      if (text && text.length > 200) return text;
    } catch (e) {
      lastErr = e;
      console.warn(`${logPrefix} ⚠️ Gemini ${modelId} failed: ${e.message}`);
    }
  }
  throw lastErr || new Error('All Gemini models failed');
}

/**
 * Generate content using OpenRouter free models.
 * @param {LlmCallParams & { modelId?: string }} params
 * @returns {Promise<string>}
 */
export async function generateWithOpenRouter({ systemInstruction, userPrompt, modelId = 'openrouter/free', logPrefix = '[llm]' }) {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not set.');

  const isExplicitlyFree = modelId.endsWith(':free');
  const isFreeRouter = modelId === 'openrouter/free';

  if (!isExplicitlyFree && !isFreeRouter) {
    console.error(`⚠️ SECURITY ALERT: Blocking non-free model call: ${modelId}`);
    throw new Error(`Permission Denied: Model ${modelId} is not verified as FREE.`);
  }

  console.log(`${logPrefix} OpenRouter fallback (${modelId})...`);

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://synapsecapital.net',
          'X-Title': 'Synapse Capital'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (response.status === 429) {
        console.warn(`${logPrefix} ⏳ Rate limited (429) on ${modelId}. Attempt ${attempt}/3. Waiting...`);
        await sleep(2000 * attempt);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (data.error) {
        if (data.error.code === 429) {
          console.warn(`${logPrefix} ⏳ Business rate limited (429) on ${modelId}. Attempt ${attempt}/3.`);
          await sleep(2000 * attempt);
          continue;
        }
        throw new Error(`OpenRouter API Business Error: ${JSON.stringify(data.error)}`);
      }

      return data.choices[0]?.message?.content;

    } catch (e) {
      lastError = e;
      console.warn(`${logPrefix} ⚠️ Attempt ${attempt} failed for ${modelId}: ${e.message}`);
      if (attempt < 3) await sleep(1000);
    }
  }

  throw lastError || new Error(`Failed to generate with ${modelId} after 3 attempts`);
}
