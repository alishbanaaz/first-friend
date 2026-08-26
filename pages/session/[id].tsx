import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import ContextPanel from '../../components/ContextPanel';
import Chat from '../../components/Chat';
import { downloadICS } from '../../utils/ics';

type Message = { id: string; sender: 'user' | 'system'; text: string; ts: string };

export default function SessionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [safetyFlag, setSafetyFlag] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) return;
    // restore session link locally if present
    const stored = localStorage.getItem(`ff_session_${id}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed);
      } catch {}
    }
  }, [id]);

  useEffect(() => {
    // persist locally
    if (!id) return;
    localStorage.setItem(`ff_session_${id}`, JSON.stringify(messages));
  }, [messages, id]);

  async function sendMessage() {
    if (!input || !id) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: input,
      ts: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
    setInput('');
    // persist via API (best effort)
    fetch('/api/message', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: id, message: msg }),
    }).catch(() => {});
  }

  async function handleSummarize() {
    if (!id) return;
    setLoading(true);
    const context = localStorage.getItem('ff_context');
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: id, messages, context: context ? JSON.parse(context) : null }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.safety === true) {
      setSafetyFlag(true);
      setSummary(null);
      return;
    }
    setSummary(data.summary);
  }

  function handleDownloadReminder() {
    const summaryText = summary || messages.slice(-10).map((m) => `${m.sender}: ${m.text}`).join('\n');
    downloadICS({
      title: 'First Friend — Reminder',
      description: summaryText + `\n\nReturn: ${window.location.href}`,
      when: new Date(Date.now() + 6 * 60 * 60 * 1000), // default 6 hours
    });
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-4 rounded shadow flex justify-between items-start">
          <div>
            <h2 className="text-lg font-medium">Anonymous session</h2>
            <p className="text-sm text-gray-500">Write freely. Optional context will help the summary.</p>
          </div>
          <div>
            <button className="text-sm text-indigo-600" onClick={() => router.push('/')}>Exit</button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <ContextPanel />
          <Chat messages={messages} />
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write what’s on your mind…"
              className="flex-1 px-3 py-2 border rounded"
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            />
            <button onClick={sendMessage} className="px-4 py-2 bg-indigo-600 text-white rounded">Send</button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSummarize} className="px-3 py-2 bg-green-600 text-white rounded" disabled={loading}>
              {loading ? 'Working…' : 'Summarize & Draft'}
            </button>
            <button onClick={handleDownloadReminder} className="px-3 py-2 bg-gray-200 rounded">Remind me in 6h (.ics)</button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); }} className="px-3 py-2 bg-gray-200 rounded">
              Copy link to return
            </button>
          </div>

          {safetyFlag && (
            <div className="p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded">
              It looks like this session includes words suggesting distress. If you are in danger, please contact local emergency services or a mental health professional. (Resources list to be added.)
            </div>
          )}

          {summary && (
            <div className="p-3 bg-white border rounded">
              <h3 className="font-medium">Summary & Draft</h3>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{summary}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(summary)} className="px-3 py-2 bg-indigo-600 text-white rounded">Copy</button>
                <button onClick={() => {
                  const blob = new Blob([summary], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `first-friend-summary-${id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} className="px-3 py-2 bg-gray-200 rounded">Download .txt</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
