import { useState } from 'react';
import type { ChatMessage } from '@trpg/shared';

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const msg: ChatMessage = {
      id: crypto.randomUUID().slice(0, 8),
      sender: '你',
      content: input,
      type: 'chat',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', height: 250 }}>
      <h3>💬 聊天</h3>
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '0.5rem' }}>
        {messages.map((m) => (
          <p key={m.id} style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>
            <strong>{m.sender}:</strong> {m.content}
          </p>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
        <input style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="輸入訊息..." />
        <button onClick={send}>送出</button>
      </div>
    </div>
  );
}
