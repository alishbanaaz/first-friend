import type { NextApiRequest, NextApiResponse } from 'next';
import { generateWithFallback } from '../../lib/gemini';

const RISK_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'harm myself', 'want to die'];

function sanitize(text: string) {
  // very basic PII scrub (emails, phone numbers)
  return text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted]').replace(/(\+?\d[\d\s\-]{6,}\d)/g, '[redacted]');
}

function detectRisk(text: string) {
  const lower = text.toLowerCase();
  return RISK_KEYWORDS.some((k) => lower.includes(k));
}

function stripCodeFence(text: string) {
  return text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
}

const RATE_LIMIT_FALLBACK = "I couldn't quite finish putting your summary together just now — I'm a bit backed up. Try again in a minute?";
const OTHER_ERROR_FALLBACK = "Something went wrong while summarizing. Please try again.";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, context } = req.body as { messages: any[]; context?: any };

  const joined = (messages ?? []).map((m: any) => `${m.sender}: ${m.text}`).join('\n');
  const sanitized = sanitize(joined);

  if (detectRisk(sanitized)) {
    return res.status(200).json({ safety: true });
  }

  const systemPrompt = `You are a neutral assistant that summarizes a private user conversation into 3–5 compassionate sentences and drafts a 1–2 sentence message the user could send to a friend. Do NOT provide medical advice or diagnosis. If the user indicated physical/hormonal context, include one neutral sentence noting that. Keep it concise and non-judgmental.`;

  const contextLine = context && context.physicalNote ? `User noted: ${context.physicalNote}` : '';
  const prompt = `${systemPrompt}\n\nContext: ${contextLine}\n\nConversation:\n${sanitized}\n\nRespond with a JSON object: {"summary":"<3-5 sentence summary>","draft":"<1-2 sentence draft>"} only. Do not wrap it in code fences or backticks.`;

  const outcome = await generateWithFallback(prompt);

  if (!outcome.ok) {
    const fallbackText = outcome.reason === 'rate_limited' ? RATE_LIMIT_FALLBACK : OTHER_ERROR_FALLBACK;
    return res.status(200).json({ safety: false, summary: fallbackText, fallback: true });
  }

  const cleaned = stripCodeFence(outcome.text);
  const jsonStart = cleaned.indexOf('{');
  const jsonStr = jsonStart >= 0 ? cleaned.slice(jsonStart) : cleaned;
  let parsed = null;
  try { parsed = JSON.parse(jsonStr); } catch (e) { parsed = { summary: cleaned, draft: '' }; }

  res.status(200).json({ safety: false, summary: `${parsed.summary}\n\n${parsed.draft}`.trim() });
}