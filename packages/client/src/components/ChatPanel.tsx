import { useEffect, useRef } from 'react';

interface Props { log: string[]; }

export default function AdventureLog({ log }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [log]);

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column', height: 250 }}>
      <h3>📖 冒險日誌</h3>
      <div style={{ flex: 1, overflowY: 'auto', marginTop: '0.5rem' }}>
        {log.map((msg, i) => (
          <p key={i} style={{ fontSize: '0.85rem', marginBottom: '0.3rem', color: msg.includes('✅') ? '#4ade80' : msg.includes('❌') ? '#f87171' : 'var(--text-primary)' }}>{msg}</p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
