import { useState } from 'react';
import type { DiceType, DiceRoll } from '@trpg/shared';
import { DICE_SIDES } from '@trpg/shared';

const DICE: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export default function DiceRoller() {
  const [result, setResult] = useState<DiceRoll | null>(null);

  const roll = (type: DiceType) => {
    const sides = DICE_SIDES[type];
    const value = Math.floor(Math.random() * sides) + 1;
    setResult({ type, count: 1, modifier: 0, results: [value], total: value });
  };

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
      <h3>🎲 擲骰</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
        {DICE.map((d) => (
          <button key={d} onClick={() => roll(d)} style={{ fontSize: '0.85rem', padding: '0.4rem 0.7rem' }}>{d}</button>
        ))}
      </div>
      {result && (
        <p style={{ marginTop: '0.5rem', fontSize: '1.2rem' }}>
          {result.type}: <strong>{result.total}</strong>
        </p>
      )}
    </div>
  );
}
