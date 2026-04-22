import { Character, Stats, Item } from '../types';
import { BASE_HP, HP_PER_LEVEL, BASE_MP, MP_PER_LEVEL, STAT_POINT_POOL, MIN_STAT, MAX_STAT, XP_PER_LEVEL } from '../constants';
import { statModifier } from './dice';

/** Validate point-buy: each stat between MIN_STAT..MAX_STAT, total cost within pool. */
export function validatePointBuy(stats: Stats, pool = STAT_POINT_POOL): boolean {
  const vals = Object.values(stats) as number[];
  if (vals.some(v => v < MIN_STAT || v > MAX_STAT)) return false;
  return vals.reduce((s, v) => s + Math.max(0, v - 10), 0) <= pool;
}

/** Calculate max HP from level and constitution. */
export function calcMaxHp(level: number, constitution: number): number {
  return BASE_HP + statModifier(constitution) + HP_PER_LEVEL * (level - 1);
}

/** Calculate max MP from level and intelligence. */
export function calcMaxMp(level: number, intelligence: number): number {
  return BASE_MP + statModifier(intelligence) + MP_PER_LEVEL * (level - 1);
}

/** Create a new level-1 character. */
export function createCharacter(id: string, name: string, stats: Stats): Character {
  const maxHp = calcMaxHp(1, stats.constitution);
  const maxMp = calcMaxMp(1, stats.intelligence);
  return {
    id, name, level: 1, experience: 0, stats: { ...stats },
    hp: maxHp, maxHp, mp: maxMp, maxMp,
    skills: [], inventory: [],
  };
}

/** Get effective stat value after equipment bonuses. */
export function effectiveStat(char: Character, key: keyof Stats): number {
  let value = char.stats[key];
  for (const item of char.inventory) {
    if (item.effect?.stat === key) value += item.effect.value;
  }
  return value;
}

/** Level up if enough XP. Returns new character or same if not enough XP. */
export function levelUp(char: Character): Character {
  const needed = XP_PER_LEVEL[char.level] ?? char.level * 1000;
  if (char.experience < needed) return char;
  const newLevel = char.level + 1;
  const maxHp = calcMaxHp(newLevel, effectiveStat(char, 'constitution'));
  const maxMp = calcMaxMp(newLevel, effectiveStat(char, 'intelligence'));
  return { ...char, level: newLevel, experience: char.experience - needed, maxHp, hp: maxHp, maxMp, mp: maxMp };
}

/** Add item to inventory. */
export function addItem(char: Character, item: Item): Character {
  return { ...char, inventory: [...char.inventory, item] };
}

/** Remove item from inventory by id. */
export function removeItem(char: Character, itemId: string): Character {
  return { ...char, inventory: char.inventory.filter(i => i.id !== itemId) };
}
