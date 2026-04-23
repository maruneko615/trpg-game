import type { GameChar } from '../pages/Game';

const STAT_LABELS: Record<string, string> = { strength: 'STR', dexterity: 'DEX', constitution: 'CON', intelligence: 'INT', wisdom: 'WIS', charisma: 'CHA' };

interface Props { char: GameChar; }

export default function CharacterSheet({ char }: Props) {
  const hpPct = (char.hp / char.maxHp) * 100;
  const sanPct = (char.san / char.maxSan) * 100;

  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1rem' }}>
      <h3>📜 {char.name}</h3>
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>❤️ HP</span><span>{char.hp}/{char.maxHp}</span></div>
        <div style={{ background: 'var(--bg-primary)', borderRadius: 4, height: 8, marginTop: 2 }}>
          <div style={{ background: hpPct > 50 ? '#4ade80' : hpPct > 25 ? '#fbbf24' : '#f87171', width: `${hpPct}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ marginTop: '0.3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}><span>🧠 SAN</span><span>{char.san}/{char.maxSan}</span></div>
        <div style={{ background: 'var(--bg-primary)', borderRadius: 4, height: 8, marginTop: 2 }}>
          <div style={{ background: sanPct > 50 ? '#a78bfa' : sanPct > 25 ? '#fbbf24' : '#f87171', width: `${sanPct}%`, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.3rem', marginTop: '0.5rem' }}>
        {Object.entries(char.stats).map(([k, v]) => (
          <span key={k} style={{ fontSize: '0.85rem' }}>{STAT_LABELS[k] || k}: {v as number}</span>
        ))}
      </div>
      {char.items.length > 0 && (
        <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--bg-card)', paddingTop: '0.4rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🎒 物品：</p>
          {char.items.map((item, i) => (
            <span key={i} style={{ fontSize: '0.8rem', background: 'var(--bg-card)', borderRadius: 4, padding: '0.1rem 0.4rem', marginRight: '0.3rem', display: 'inline-block', marginTop: '0.2rem' }}>{item}</span>
          ))}
        </div>
      )}
    </div>
  );
}
