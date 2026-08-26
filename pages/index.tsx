import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  async function handleStart() {
    const res = await fetch('/api/session', { method: 'POST' });
    const data = await res.json();
    router.push(`/session/${data.id}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">First Friend</h1>
        <p className="mb-6 text-gray-700">
          An anonymous, judgment-free chat space to organize your thoughts and get a short summary or a message draft you can share.
        </p>
        <button
          onClick={handleStart}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Start anonymously — one tap
        </button>
        <p className="mt-4 text-sm text-gray-500">
          We keep context local by default. Not a replacement for professional help.
        </p>
      </div>
    </main>
  );
}
