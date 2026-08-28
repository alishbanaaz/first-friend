import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  // This endpoint sends due reminders immediately when called. Intended to be invoked by a scheduled job.
  if (!SENDGRID_API_KEY || !SENDGRID_FROM) return res.status(400).json({ error: 'sendgrid_not_configured' });

  try {
    const { data: reminders, error } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .lte('remind_at', new Date().toISOString())
      .eq('sent', false)
      .limit(50);

    if (error) throw error;

    const results: any[] = [];

    for (const r of reminders as any[]) {
      const to = r.email;
      const sessionLink = `${APP_URL}/session/${r.session_id}`;
      const subject = 'First Friend — Reminder';
      const text = `${r.summary ?? 'A reminder from First Friend.\n'}\nReturn to your session: ${sessionLink}`;

      try {
        await sgMail.send({
          to,
          from: SENDGRID_FROM,
          subject,
          text,
        });
        await supabaseAdmin.from('reminders').update({ sent: true, last_error: null }).eq('id', r.id);
        results.push({ id: r.id, ok: true });
      } catch (sendErr: any) {
        console.error('send error', sendErr);
        await supabaseAdmin.from('reminders').update({ last_error: String(sendErr.message ?? sendErr) }).eq('id', r.id);
        results.push({ id: r.id, ok: false, error: String(sendErr.message ?? sendErr) });
      }
    }

    res.status(200).json({ results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'send_failed' });
  }
}
