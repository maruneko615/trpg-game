import { useState } from 'react';

interface Props {
  onNavigate: (page: string, id?: string, scenario?: string) => void;
}

const SCENARIOS = [
  { id: 'coc', emoji: '🐙', title: '克蘇魯的呼喚', desc: '1925年阿卡姆鎮，調查教授失蹤案。面對不可名狀的恐怖...', color: '#1a472a' },
  { id: 'kaidan', emoji: '👻', title: '日式都市怪談', desc: '現代東京，深夜的都市傳說。你能在怪異的事件中存活嗎...', color: '#2a1a3a' },
];

export default function Home({ onNavigate }: Props) {
  const [joinCode, setJoinCode] = useState('');
  const handleJoin = () => { if (joinCode.trim()) onNavigate('game', joinCode.trim()); };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', gap: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem' }}>🎲 TRPG Game</h1>
      <p style={{ color: 'var(--text-secondary)' }}>選擇劇本開始冒險</p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {SCENARIOS.map(s => (
          <button key={s.id} onClick={() => onNavigate('game', crypto.randomUUID().slice(0, 8), s.id)}
            style={{ background: s.color, padding: '1.5rem', borderRadius: 12, width: 260, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
            <strong style={{ fontSize: '1.1rem' }}>{s.title}</strong>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input placeholder="輸入遊戲代碼加入" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleJoin()} />
        <button onClick={handleJoin}>加入</button>
      </div>
      <button onClick={() => onNavigate('character')} style={{ background: 'var(--bg-card)' }}>建立角色</button>
    </div>
  );
}
