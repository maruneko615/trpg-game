import { Character, Enemy, CombatState } from '../types';
import { rollDice, rollSingle, statModifier, skillCheck } from './dice';
import { effectiveStat } from './character';

export interface InitiativeEntry {
  id: string;
  name: string;
  roll: number;
  isPlayer: boolean;
}

export interface CombatResult {
  hit: boolean;
  damage: number;
  critical: boolean;
  message: string;
}

/** Roll initiative for all combatants. Returns sorted (highest first). */
export function rollInitiative(
  players: Character[], enemies: Enemy[], rng: () => number = Math.random,
): InitiativeEntry[] {
  const entries: InitiativeEntry[] = [
    ...players.map(p => ({
      id: p.id, name: p.name, isPlayer: true,
      roll: rollSingle(20, rng) + statModifier(effectiveStat(p, 'dexterity')),
    })),
    ...enemies.map(e => ({
      id: e.id, name: e.name, isPlayer: false,
      roll: rollSingle(20, rng) + statModifier(e.stats.dexterity),
    })),
  ];
  return entries.sort((a, b) => b.roll - a.roll);
}

/** Build a CombatState from initiative entries. */
export function initCombatState(entries: InitiativeEntry[]): CombatState {
  return { turnOrder: entries.map(e => e.id), currentTurnIndex: 0, round: 1 };
}

/** Advance to next turn. */
export function nextTurn(state: CombatState): CombatState {
  const next = state.currentTurnIndex + 1;
  if (next >= state.turnOrder.length) {
    return { ...state, round: state.round + 1, currentTurnIndex: 0 };
  }
  return { ...state, currentTurnIndex: next };
}

/** AC = 10 + dex modifier. */
export function calcAC(dexterity: number): number {
  return 10 + statModifier(dexterity);
}

/** Resolve a basic melee attack. */
export function resolveAttack(
  attackerStr: number, defenderDex: number, rng: () => number = Math.random,
): CombatResult {
  const mod = statModifier(attackerStr);
  const ac = calcAC(defenderDex);
  const roll = rollSingle(20, rng);
  if (roll === 1) return { hit: false, damage: 0, critical: false, message: 'Critical miss!' };
  const hit = roll === 20 || (roll + mod >= ac);
  if (!hit) return { hit: false, damage: 0, critical: false, message: 'Miss.' };
  let damage = Math.max(1, rollDice('d6', 1, mod, rng).total);
  const critical = roll === 20;
  if (critical) damage *= 2;
  return { hit: true, damage, critical, message: critical ? 'Critical hit!' : 'Hit.' };
}

/** Resolve a spell attack (uses intelligence vs wisdom save). */
export function resolveSpell(
  casterInt: number, targetWis: number, power: number, rng: () => number = Math.random,
): CombatResult {
  const mod = statModifier(casterInt);
  const dc = 10 + statModifier(targetWis);
  const check = skillCheck('intelligence', casterInt, dc, rng);
  if (!check.success && !check.critical) return { hit: false, damage: 0, critical: false, message: 'Spell resisted.' };
  let damage = Math.max(1, rollDice('d8', 1, mod + power, rng).total);
  if (check.critical) damage *= 2;
  return { hit: true, damage, critical: check.critical, message: check.critical ? 'Spell critical!' : 'Spell hit.' };
}

/** Apply damage to a character. */
export function applyDamage(char: Character, damage: number): Character {
  return { ...char, hp: Math.max(0, Math.min(char.maxHp, char.hp - damage)) };
}

/** Apply damage to an enemy. */
export function applyDamageToEnemy(enemy: Enemy, damage: number): Enemy {
  return { ...enemy, hp: Math.max(0, Math.min(enemy.maxHp, enemy.hp - damage)) };
}

/** Deduct MP. */
export function deductMp(char: Character, cost: number): Character {
  return { ...char, mp: Math.max(0, char.mp - cost) };
}
