import { CombatState } from '@trpg/shared';
import { rollDice } from './dice';
import { getCharacter } from './character';

export function rollInitiative(characterIds: string[]): CombatState {
  const entries = characterIds.map(id => ({
    id,
    roll: rollDice('d20', 1, Math.floor(((getCharacter(id)?.stats.dexterity ?? 10) - 10) / 2)).total,
  })).sort((a, b) => b.roll - a.roll);

  return { round: 1, turnOrder: entries.map(e => e.id), currentTurnIndex: 0 };
}

export function nextTurn(state: CombatState): CombatState {
  const next = state.currentTurnIndex + 1;
  if (next >= state.turnOrder.length) {
    return { ...state, round: state.round + 1, currentTurnIndex: 0 };
  }
  return { ...state, currentTurnIndex: next };
}

export interface CombatActionInput {
  type: 'attack' | 'defend' | 'spell' | 'item' | 'flee';
  sourceId: string;
  targetId: string;
}

export function resolveCombatAction(action: CombatActionInput): { hit: boolean; damage: number; description: string } {
  const source = getCharacter(action.sourceId);
  const target = getCharacter(action.targetId);
  if (!source || !target) return { hit: false, damage: 0, description: 'Invalid combatant' };

  const strMod = Math.floor((source.stats.strength - 10) / 2);
  const intMod = Math.floor((source.stats.intelligence - 10) / 2);
  const targetAC = 10 + Math.floor((target.stats.dexterity - 10) / 2);

  if (action.type === 'attack') {
    const atkRoll = rollDice('d20', 1, strMod);
    const hit = atkRoll.total >= targetAC;
    let damage = 0;
    if (hit) {
      damage = rollDice('d8', 1, strMod).total;
      target.hp = Math.max(0, target.hp - damage);
    }
    return { hit, damage, description: `${source.name} attacks ${target.name}: ${hit ? `hit for ${damage} damage` : 'miss'}` };
  }

  if (action.type === 'defend') {
    return { hit: false, damage: 0, description: `${source.name} takes a defensive stance` };
  }

  if (action.type === 'spell') {
    const damage = rollDice('d6', 2, intMod).total;
    target.hp = Math.max(0, target.hp - damage);
    return { hit: true, damage, description: `${source.name} casts a spell on ${target.name} for ${damage} damage` };
  }

  return { hit: false, damage: 0, description: `${source.name} uses ${action.type}` };
}
