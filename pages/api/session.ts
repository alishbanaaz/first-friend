import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const id = crypto.randomUUID();

  // Minimal attempt to write a session row; table must be created in Supabase: sessions(id, created_at, messages jsonb, retention_expires_at)
  try {
    await supabase.from('sessions').insert([{ id, messages: [], retention_expires_at: null }]);
  } catch (e) {
    // ignore; still return id for client-side ephemeral use
  }

  res.status(200).json({ id });
}
