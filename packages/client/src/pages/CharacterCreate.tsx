import { useState } from 'react';

interface Stats {
  strength: number; dexterity: number; constitution: number;
  intelligence: number; wisdom: number; charisma: number;
}

const DEFAULT_STATS: Stats = {
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
};

const LABELS: Record<keyof Stats, string> = {
  strength: 'STR', dexterity: 'DEX', constitution: 'CON',
  intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
};

interface Props { onBack: () => void; }

export default function CharacterCreate({ onBack }: Props) {
  const [name, setName] = useState('');
  const [stats, setStats] = useState<Stats>({ ...DEFAULT_STATS });

  const update = (key: keyof Stats, delta: number) => {
    setStats((prev) => ({ ...prev, [key]: Math.max(3, Math.min(20, prev[key] + delta)) }));
  };

  const handleSubmit = () => {
    const hp = 10 + Math.floor((stats.constitution - 10) / 2);
    const mp = 5 + Math.floor((stats.intelligence - 10) / 2);
    const character = { id: crypto.randomUUID().slice(0, 8), name, level: 1, experience: 0, stats, hp, maxHp: hp, mp, maxMp: mp, skills: [], inventory: [] };
    localStorage.setItem('trpg-character', JSON.stringify(character));
    onBack();
  };

  return (
    <div className="container" style={{ maxWidth: 500, margin: '2rem auto' }}>
      <h2>🛡️ 建立角色</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <input placeholder="角色名稱" value={name} onChange={(e) => setName(e.target.value)} />
        {(Object.keys(LABELS) as (keyof Stats)[]).map((key) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ width: 40 }}>{LABELS[key]}</label>
            <button onClick={() => update(key, -1)}>−</button>
            <span style={{ width: 30, textAlign: 'center' }}>{stats[key]}</span>
            <button onClick={() => update(key, 1)}>+</button>
          </div>
        ))}
        <button onClick={handleSubmit} disabled={!name.trim()}>建立角色</button>
        <button onClick={onBack} style={{ background: 'var(--bg-card)' }}>← 返回</button>
      </div>
    </div>
  );
}
