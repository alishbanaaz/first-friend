export function buildSummarizePrompt(sanitizedConversation: string, contextLine?: string) {
  const systemPrompt = `You are a neutral assistant that summarizes a private user conversation into 3–5 compassionate sentences and drafts a 1–2 sentence message the user could send to a friend. Do NOT provide medical advice or diagnosis. If the user indicated physical/hormonal context, include one neutral sentence noting that. Keep it concise and non-judgmental.`;
  return `${systemPrompt}\n\nContext: ${contextLine ?? ''}\n\nConversation:\n${sanitizedConversation}\n\nRespond with a JSON object: {"summary":"<3-5 sentence summary>","draft":"<1-2 sentence draft>"} only.`;
}
