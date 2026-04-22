import { v4 as uuid } from 'uuid';
import { Character, Stats, Item, DEFAULT_STATS, BASE_HP, HP_PER_LEVEL, BASE_MP, MP_PER_LEVEL } from '@trpg/shared';

const characters = new Map<string, Character>();

export function createCharacter(name: string, stats?: Partial<Stats>): Character {
  const merged: Stats = { ...DEFAULT_STATS, ...stats };
  const conMod = Math.floor((merged.constitution - 10) / 2);
  const intMod = Math.floor((merged.intelligence - 10) / 2);
  const char: Character = {
    id: uuid(), name, level: 1,
    hp: BASE_HP + conMod, maxHp: BASE_HP + conMod,
    mp: BASE_MP + intMod, maxMp: BASE_MP + intMod,
    stats: merged, skills: [], inventory: [], experience: 0,
  };
  characters.set(char.id, char);
  return char;
}

export function getCharacter(id: string): Character | undefined {
  return characters.get(id);
}

export function levelUp(id: string): Character | undefined {
  const char = characters.get(id);
  if (!char) return undefined;
  char.level += 1;
  const conMod = Math.floor((char.stats.constitution - 10) / 2);
  const intMod = Math.floor((char.stats.intelligence - 10) / 2);
  char.maxHp += HP_PER_LEVEL + conMod;
  char.hp = char.maxHp;
  char.maxMp += MP_PER_LEVEL + intMod;
  char.mp = char.maxMp;
  return char;
}

export function addItem(id: string, item: Omit<Item, 'id'>): Character | undefined {
  const char = characters.get(id);
  if (!char) return undefined;
  char.inventory.push({ ...item, id: uuid() });
  return char;
}
