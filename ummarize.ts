[1mdiff --git a/pages/api/respond.ts b/pages/api/respond.ts[m
[1mindex ff85756..73ceb02 100644[m
[1m--- a/pages/api/respond.ts[m
[1m+++ b/pages/api/respond.ts[m
[36m@@ -1,5 +1,5 @@[m
 import type { NextApiRequest, NextApiResponse } from 'next';[m
[31m-import { GoogleGenerativeAI } from '@google/generative-ai';[m
[32m+[m[32mimport { generateWithFallback } from '../../lib/gemini';[m
 [m
 const RISK_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'harm myself', 'want to die', 'no reason to live', 'better off dead', 'hurting myself'];[m
 [m
[36m@@ -26,6 +26,9 @@[m [mRules for how you talk:[m
 - Use casual, natural phrasing ("that sounds rough," "ugh, I'm sorry," "that's a lot to carry") instead of formal wording.[m
 - Reply with plain text only. No JSON, no markdown, no code fences.`;[m
 [m
[32m+[m[32mconst RATE_LIMIT_FALLBACK = "Sorry, I'm a little overwhelmed right now — give me just a moment and try sending that again in a bit? I promise I'm still here.";[m
[32m+[m[32mconst OTHER_ERROR_FALLBACK = "Hmm, something went sideways on my end. Mind trying that again?";[m
[32m+[m
 export default async function handler(req: NextApiRequest, res: NextApiResponse) {[m
   if (req.method !== 'POST') return res.status(405).end();[m
   const { message, recentHistory, context } = req.body as { message: string; recentHistory?: string; context?: any };[m
[36m@@ -42,14 +45,13 @@[m [mexport default async function handler(req: NextApiRequest, res: NextApiResponse)[m
 [m
   const prompt = `${SYSTEM_PROMPT}\n\n${contextLine}\n\n${historyLine}Their latest message: "${message}"\n\nReply as their caring friend would, following the rules above.`;[m
 [m
[31m-  try {[m
[31m-    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);[m
[31m-    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });[m
[31m-    const result = await model.generateContent(prompt);[m
[31m-    const reply = stripCodeFence(result.response.text() ?? '');[m
[31m-    res.status(200).json({ safety: false, reply });[m
[31m-  } catch (err) {[m
[31m-    console.error(err);[m
[31m-    res.status(500).json({ error: 'llm_error' });[m
[32m+[m[32m  const outcome = await generateWithFallback(prompt);[m
[32m+[m
[32m+[m[32m  if (!outcome.ok) {[m
[32m+[m[32m    const fallbackReply = outcome.reason === 'rate_limited' ? RATE_LIMIT_FALLBACK : OTHER_ERROR_FALLBACK;[m
[32m+[m[32m    return res.status(200).json({ safety: false, reply: fallbackReply, fallback: true });[m
   }[m
[32m+[m
[32m+[m[32m  const reply = stripCodeFence(outcome.text);[m
[32m+[m[32m  res.status(200).json({ safety: false, reply });[m
 }[m
\ No newline at end of file[m
