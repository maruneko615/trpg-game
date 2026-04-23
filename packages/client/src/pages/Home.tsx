import { useState } from 'react';

interface Props {
  onNavigate: (page: string, id?: string) => void;
}

export default function Home({ onNavigate }: Props) {
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => onNavigate('game', crypto.randomUUID().slice(0, 8));
  const handleJoin = () => { if (joinCode.trim()) onNavigate('game', joinCode.trim()); };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem' }}>🎲 TRPG Game</h1>
      <button onClick={handleCreate}>建立新遊戲</button>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input placeholder="輸入遊戲代碼" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleJoin()} />
        <button onClick={handleJoin}>加入遊戲</button>
      </div>
      <button onClick={() => onNavigate('character')} style={{ background: 'var(--bg-card)' }}>建立角色</button>
    </div>
  );
}
