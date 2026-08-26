import { useEffect, useState } from 'react';

export default function ContextPanel() {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [hormone, setHormone] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('ff_context');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGender(parsed.gender ?? null);
        setHormone(parsed.hormone ?? null);
      } catch {}
    }
  }, []);

  function save() {
    const payload = { gender, hormone };
    localStorage.setItem('ff_context', JSON.stringify(payload));
    setOpen(false);
  }

  function clear() {
    localStorage.removeItem('ff_context');
    setGender(null);
    setHormone(null);
  }

  return (
    <div className="p-3 bg-white border rounded">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Optional context</h4>
          <p className="text-sm text-gray-500">Add gender or note if hormones/physical factors may be relevant. Stored locally by default.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setOpen(!open)} className="text-sm text-indigo-600">Edit</button>
          <button onClick={clear} className="text-sm text-gray-500">Clear</button>
        </div>
      </div>

      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium">Gender (optional)</label>
            <div className="mt-1 flex gap-2">
              {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setGender(opt)}
                  className={`px-2 py-1 border rounded ${gender === opt ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Physical/hormonal factors (optional)</label>
            <div className="mt-1 flex gap-2">
              {['Yes', 'Maybe', 'No', 'Prefer not to say'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setHormone(opt)}
                  className={`px-2 py-1 border rounded ${hormone === opt ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
            <button onClick={() => setOpen(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
          </div>
        </div>
      )}

      {!open && (gender || hormone) && (
        <div className="mt-2 text-sm text-gray-700">
          <div>Gender: <strong>{gender}</strong></div>
          <div>Physical/hormonal: <strong>{hormone}</strong></div>
        </div>
      )}
    </div>
  );
}
