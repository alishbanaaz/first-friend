import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

function isValidEmail(e: string) {
  return /\S+@\S+\.\S+/.test(e);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionId, email, remindAt, summary, saveEmail } = req.body as { sessionId: string; email: string; remindAt: string; summary?: string; saveEmail?: boolean };
  if (!sessionId || !email || !remindAt) return res.status(400).json({ error: 'missing' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'invalid_email' });

  try {
    const { error } = await supabaseAdmin.from('reminders').insert([{ session_id: sessionId, email, remind_at: remindAt, summary: summary ?? null }]);
    if (error) throw error;
    // Optionally persist email to a small "contacts" table if saveEmail === true (not implemented here)
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('reminder create error', e);
    res.status(500).json({ error: 'db_error' });
  }
}
