import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Stats, Character } from '@trpg/shared';
import { DEFAULT_STATS, BASE_HP, HP_PER_LEVEL, BASE_MP, MP_PER_LEVEL, MIN_STAT, MAX_STAT } from '@trpg/shared';

const LABELS: Record<keyof Stats, string> = {
  strength: 'STR', dexterity: 'DEX', constitution: 'CON',
  intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA',
};

export default function CharacterCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [stats, setStats] = useState<Stats>({ ...DEFAULT_STATS });

  const update = (key: keyof Stats, delta: number) => {
    setStats((prev) => ({ ...prev, [key]: Math.max(MIN_STAT, Math.min(MAX_STAT, prev[key] + delta)) }));
  };

  const handleSubmit = () => {
    const character: Character = {
      id: crypto.randomUUID().slice(0, 8),
      name,
      level: 1,
      experience: 0,
      stats,
      hp: BASE_HP + Math.floor((stats.constitution - 10) / 2),
      maxHp: BASE_HP + Math.floor((stats.constitution - 10) / 2),
      mp: BASE_MP + Math.floor((stats.intelligence - 10) / 2),
      maxMp: BASE_MP + Math.floor((stats.intelligence - 10) / 2),
      skills: [],
      inventory: [],
    };
    localStorage.setItem('trpg-character', JSON.stringify(character));
    navigate('/');
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
      </div>
    </div>
  );
}
