import { useEffect, useState } from 'react';

export default function ContextPanel() {
  const [open, setOpen] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [genderOther, setGenderOther] = useState('');
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [physicalNote, setPhysicalNote] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('ff_context');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setGender(parsed.gender ?? null);
        setGenderOther(parsed.genderOther ?? '');
        setAgeRange(parsed.ageRange ?? null);
        setPhysicalNote(parsed.physicalNote ?? '');
      } catch {}
    }
  }, []);

  function save() {
    const payload = {
      gender,
      genderOther: gender === 'Other' ? genderOther : '',
      ageRange,
      physicalNote,
    };
    localStorage.setItem('ff_context', JSON.stringify(payload));
    setOpen(false);
  }

  function clear() {
    localStorage.removeItem('ff_context');
    setGender(null);
    setGenderOther('');
    setAgeRange(null);
    setPhysicalNote('');
  }

  const genderOptions = ['Female', 'Male', 'Non-binary', 'Transgender', 'Genderfluid', 'Prefer not to say', 'Other'];
  const ageOptions = ['Under 18', '18-24', '25-34', '35-44', '45+', 'Prefer not to say'];

  return (
    <div className="p-3 bg-white border rounded">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium">Optional context</h4>
          <p className="text-sm text-gray-500">Everything here is optional and stored only on your device. Skip anything you don't want to share.</p>
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
            <div className="mt-1 flex flex-wrap gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setGender(opt)}
                  className={`px-2 py-1 border rounded ${gender === opt ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {gender === 'Other' && (
              <input
                value={genderOther}
                onChange={(e) => setGenderOther(e.target.value)}
                placeholder="How would you describe yourself?"
                className="mt-2 w-full px-2 py-1 border rounded"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Age range (optional)</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {ageOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAgeRange(opt)}
                  className={`px-2 py-1 border rounded ${ageRange === opt ? 'bg-indigo-600 text-white' : 'bg-white'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Physical or hormonal factors (optional)</label>
            <p className="text-xs text-gray-500 mb-1">Anything relevant to how you're feeling right now — a cycle phase, sleep, stress, anything. Written in your own words.</p>
            <textarea
              value={physicalNote}
              onChange={(e) => setPhysicalNote(e.target.value)}
              placeholder="e.g. haven't slept well, or mid-cycle, or nothing specific"
              className="w-full px-2 py-1 border rounded"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
            <button onClick={() => setOpen(false)} className="px-3 py-1 bg-gray-200 rounded">Cancel</button>
          </div>
        </div>
      )}

      {!open && (gender || ageRange || physicalNote) && (
        <div className="mt-2 text-sm text-gray-700 space-y-1">
          {gender && <div>Gender: <strong>{gender === 'Other' ? genderOther || 'Other' : gender}</strong></div>}
          {ageRange && <div>Age range: <strong>{ageRange}</strong></div>}
          {physicalNote && <div>Note: <strong>{physicalNote}</strong></div>}
        </div>
      )}
    </div>
  );
}