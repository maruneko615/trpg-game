import { DiceType, DiceRoll, Stats } from '../types';
import { DICE_SIDES } from '../constants';

/** Roll a single die, returning 1..max. */
export function rollSingle(max: number, rng: () => number = Math.random): number {
  return Math.floor(rng() * max) + 1;
}

/** Roll `count` dice of `type` and add `modifier`. */
export function rollDice(
  type: DiceType, count = 1, modifier = 0, rng: () => number = Math.random,
): DiceRoll {
  const max = DICE_SIDES[type];
  const results = Array.from({ length: count }, () => rollSingle(max, rng));
  const total = results.reduce((s, v) => s + v, 0) + modifier;
  return { type, count, modifier, results, total };
}

/** Roll 2d20, keep highest (advantage) or lowest (disadvantage). */
export function rollAdvantage(
  advantage: boolean, modifier = 0, rng: () => number = Math.random,
): DiceRoll {
  const results = [rollSingle(20, rng), rollSingle(20, rng)];
  const picked = advantage ? Math.max(...results) : Math.min(...results);
  return { type: 'd20', count: 2, modifier, results, total: picked + modifier };
}

/** Stat modifier: (stat - 10) / 2 floored. */
export function statModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

/** Skill check against a DC. Natural 20 = crit success, natural 1 = crit fail. */
export function skillCheck(
  stat: keyof Stats, statValue: number, dc: number, rng: () => number = Math.random,
): { roll: number; total: number; dc: number; success: boolean; critical: boolean; fumble: boolean } {
  const roll = rollSingle(20, rng);
  const mod = statModifier(statValue);
  const total = roll + mod;
  return { roll, total, dc, success: total >= dc, critical: roll === 20, fumble: roll === 1 };
}
