import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-3.6-flash';
const RETRY_DELAY_MS = 1500;

function isRateLimitError(err: any) {
  const status = err?.status ?? err?.response?.status;
  const message = String(err?.message ?? '').toLowerCase();
  return (
    status === 429 ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('resource_exhausted')
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type GeminiOutcome =
  | { ok: true; text: string }
  | { ok: false; reason: 'rate_limited' }
  | { ok: false; reason: 'other_error' };

export async function generateWithFallback(prompt: string): Promise<GeminiOutcome> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  try {
    const result = await model.generateContent(prompt);
    return { ok: true, text: result.response.text() ?? '' };
  } catch (err) {
    if (!isRateLimitError(err)) {
      console.error('Gemini error (non-rate-limit):', err);
      return { ok: false, reason: 'other_error' };
    }

    console.warn('Gemini rate limit hit, retrying once after delay...');
    await sleep(RETRY_DELAY_MS);

    try {
      const retryResult = await model.generateContent(prompt);
      return { ok: true, text: retryResult.response.text() ?? '' };
    } catch (retryErr) {
      console.error('Gemini retry also failed:', retryErr);
      return { ok: false, reason: isRateLimitError(retryErr) ? 'rate_limited' : 'other_error' };
    }
  }
}