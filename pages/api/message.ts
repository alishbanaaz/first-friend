import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { sessionId, message } = req.body;
  if (!sessionId || !message) return res.status(400).json({ error: 'missing' });

  try {
    // append message into messages jsonb array (best effort)
    const { data, error } = await supabase
      .from('sessions')
      .select('messages')
      .eq('id', sessionId)
      .single();

    if (!data || error) {
      // fallback: try upsert
      await supabase.from('sessions').upsert({ id: sessionId, messages: [message] });
      return res.status(200).json({ ok: true });
    }

    const messages = Array.isArray(data.messages) ? data.messages : [];
    messages.push(message);
    await supabase.from('sessions').update({ messages }).eq('id', sessionId);
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'db_error' });
  }
}
