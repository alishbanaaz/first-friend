import { useState } from 'react';

export default function ReminderPanel({ sessionId, defaultSummary, t }: { sessionId: string; defaultSummary: string | null; t: any }) {
  const [email, setEmail] = useState('');
  const [preset, setPreset] = useState('6h');
  const [custom, setCustom] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function computeRemindAt() {
    const now = new Date();
    if (preset === '6h') return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    if (preset === '24h') return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    if (preset === '3d') return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    if (preset === 'custom' && custom) return new Date(custom).toISOString();
    return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
  }

  async function handleCreate() {
    if (!email || !consent) { setMessage(t['reminder_require_consent']); return; }
    setLoading(true);
    const remindAt = computeRemindAt();
    try {
      const res = await fetch('/api/reminder', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sessionId, email, remindAt, summary: defaultSummary }) });
      const data = await res.json();
      if (data.ok) {
        setMessage(t['reminder_sent_ok']);
      } else {
        setMessage(t['reminder_sent_error']);
      }
    } catch (e) {
      setMessage(t['reminder_sent_error']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 bg-white border rounded">
      <h4 className="font-medium">{t['reminder_title']}</h4>
      <p className="text-sm text-gray-500">{t['reminder_desc']}</p>

      <div className="mt-2 space-y-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t['email_placeholder']} className="w-full px-2 py-1 border rounded" />
        <div className="flex gap-2">
          <button onClick={() => setPreset('6h')} className={`px-2 py-1 border rounded ${preset==='6h'?'bg-indigo-600 text-white':''}`}>6 {t['hours']}</button>
          <button onClick={() => setPreset('24h')} className={`px-2 py-1 border rounded ${preset==='24h'?'bg-indigo-600 text-white':''}`}>24 {t['hours']}</button>
          <button onClick={() => setPreset('3d')} className={`px-2 py-1 border rounded ${preset==='3d'?'bg-indigo-600 text-white':''}`}>3 {t['days']}</button>
          <button onClick={() => setPreset('custom')} className={`px-2 py-1 border rounded ${preset==='custom'?'bg-indigo-600 text-white':''}`}>{t['custom']}</button>
        </div>
        {preset === 'custom' && (
          <input type="datetime-local" value={custom} onChange={(e) => setCustom(e.target.value)} className="w-full px-2 py-1 border rounded" />
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>{t['reminder_consent']}</span>
        </label>

        <div className="flex gap-2">
          <button onClick={handleCreate} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded">{loading ? t['working'] : t['set_reminder']}</button>
        </div>

        {message && <div className="text-sm text-gray-700">{message}</div>}
      </div>
    </div>
  );
}
