import type { CombatState } from '@trpg/shared';

const placeholder: CombatState = { turnOrder: [], currentTurnIndex: 0, round: 0 };

export default function CombatView() {
  const combat = placeholder;

  if (combat.turnOrder.length === 0) return null;

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '1rem' }}>
      <h3>⚔️ 戰鬥 — 第 {combat.round} 回合</h3>
      <ul>
        {combat.turnOrder.map((id, i) => (
          <li key={id} style={{ fontWeight: i === combat.currentTurnIndex ? 'bold' : 'normal' }}>
            {i === combat.currentTurnIndex ? '▶ ' : ''}{id}
          </li>
        ))}
      </ul>
    </div>
  );
}
