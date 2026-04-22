import { useEffect, useState } from 'react';
import type { Character } from '@trpg/shared';

export default function CharacterSheet() {
  const [char, setChar] = useState<Character | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('trpg-character');
    if (saved) setChar(JSON.parse(saved));
  }, []);

  if (!char) return <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}><p>尚未建立角色</p></div>;

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
      <h3>📜 {char.name}</h3>
      <p>Lv.{char.level} | EXP: {char.experience}</p>
      <p>HP: {char.hp}/{char.maxHp} | MP: {char.mp}/{char.maxMp}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', marginTop: '0.5rem' }}>
        {Object.entries(char.stats).map(([k, v]) => (
          <span key={k} style={{ fontSize: '0.85rem' }}>{k.slice(0, 3).toUpperCase()}: {v as number}</span>
        ))}
      </div>
    </div>
  );
}
