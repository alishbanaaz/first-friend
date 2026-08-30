import type { NextApiRequest, NextApiResponse } from 'next';
import { generateWithFallback } from '../../lib/gemini';

const RISK_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'harm myself', 'want to die', 'no reason to live', 'better off dead', 'hurting myself'];

function detectRisk(text: string) {
  const lower = text.toLowerCase();
  return RISK_KEYWORDS.some((k) => lower.includes(k));
}

function stripCodeFence(text: string) {
  return text.replace(/```[a-z]*\s*/gi, '').replace(/```/g, '').trim();
}

const SYSTEM_PROMPT = `You are a warm, emotionally present companion — like a close friend who is genuinely listening, not a therapist or assistant.

Rules for how you talk:
- React to the specific thing they said, not a generic emotion label.
- Keep replies short — 1 to 3 sentences, like a real text from a friend.
- Don't repeat their words back to them ("it sounds like you feel...").
- Avoid clinical or therapy language entirely (no "validate," "process," "cope").
- Don't always ask a question. Sometimes just sit with what they said.
- If you do ask something, make it specific to their message, not generic.
- Never give medical, legal, or diagnostic advice.
- Be honest that you're an AI companion if asked directly, but don't lead with disclaimers unprompted.
- Use casual, natural phrasing ("that sounds rough," "ugh, I'm sorry," "that's a lot to carry") instead of formal wording.
- Reply with plain text only. No JSON, no markdown, no code fences.`;

const RATE_LIMIT_FALLBACK = "Sorry, I'm a little overwhelmed right now — give me just a moment and try sending that again in a bit? I promise I'm still here.";
const OTHER_ERROR_FALLBACK = "Hmm, something went sideways on my end. Mind trying that again?";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message, recentHistory, context } = req.body as { message: string; recentHistory?: string; context?: any };

  if (detectRisk(message)) {
    return res.status(200).json({
      safety: true,
      reply: "I'm really glad you told me. What you're feeling matters, and you don't have to carry it alone — please reach out to a crisis line or someone you trust right now. I'm here too, but a real person trained for this moment can help you more than I can.",
    });
  }

  const contextLine = context && context.physicalNote ? `They mentioned: ${context.physicalNote}.` : '';
  const historyLine = recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : '';

  const prompt = `${SYSTEM_PROMPT}\n\n${contextLine}\n\n${historyLine}Their latest message: "${message}"\n\nReply as their caring friend would, following the rules above.`;

  const outcome = await generateWithFallback(prompt);

  if (!outcome.ok) {
    const fallbackReply = outcome.reason === 'rate_limited' ? RATE_LIMIT_FALLBACK : OTHER_ERROR_FALLBACK;
    return res.status(200).json({ safety: false, reply: fallbackReply, fallback: true });
  }

  const reply = stripCodeFence(outcome.text);
  res.status(200).json({ safety: false, reply });
}