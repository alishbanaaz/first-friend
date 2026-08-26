export default function Chat({ messages }: { messages: { id: string; sender: 'user' | 'system'; text: string; ts: string }[] }) {
  return (
    <div className="bg-white border rounded p-3 max-h-96 overflow-auto">
      {messages.length === 0 && <div className="text-sm text-gray-500">No messages yet — start by typing what’s on your mind.</div>}
      {messages.map((m) => (
        <div key={m.id} className={`mb-3 ${m.sender === 'user' ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block px-3 py-2 rounded ${m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
          <div className="text-xs text-gray-400 mt-1">{new Date(m.ts).toLocaleTimeString()}</div>
        </div>
      ))}
    </div>
  );
}
