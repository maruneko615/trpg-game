import { Enemy } from '../types';

export const DEFAULT_ENEMIES: Enemy[] = [
  {
    id: 'goblin', name: '哥布林', level: 1, hp: 12, maxHp: 12, description: '矮小但狡猾的綠皮生物',
    stats: { strength: 8, dexterity: 12, constitution: 10, intelligence: 6, wisdom: 8, charisma: 6 },
    skills: [], expReward: 25, goldReward: 10,
  },
  {
    id: 'skeleton', name: '骷髏兵', level: 2, hp: 18, maxHp: 18, description: '被黑暗魔法復活的骸骨戰士',
    stats: { strength: 10, dexterity: 10, constitution: 12, intelligence: 4, wisdom: 6, charisma: 4 },
    skills: ['power_strike'], expReward: 40, goldReward: 15,
  },
  {
    id: 'wolf', name: '灰狼', level: 1, hp: 14, maxHp: 14, description: '兇猛的野狼',
    stats: { strength: 12, dexterity: 14, constitution: 10, intelligence: 4, wisdom: 10, charisma: 6 },
    skills: [], expReward: 30, goldReward: 5,
  },
  {
    id: 'dark_mage', name: '暗黑法師', level: 3, hp: 20, maxHp: 20, description: '操縱黑暗魔法的邪惡法師',
    stats: { strength: 8, dexterity: 10, constitution: 10, intelligence: 16, wisdom: 14, charisma: 10 },
    skills: ['fireball', 'ice_shard'], expReward: 80, goldReward: 50,
  },
  {
    id: 'orc_warrior', name: '獸人戰士', level: 3, hp: 28, maxHp: 28, description: '強壯的獸人戰士',
    stats: { strength: 16, dexterity: 10, constitution: 14, intelligence: 6, wisdom: 8, charisma: 8 },
    skills: ['power_strike', 'shield_bash'], expReward: 70, goldReward: 35,
  },
  {
    id: 'dragon', name: '幼龍', level: 5, hp: 50, maxHp: 50, description: '年幼但依然強大的龍',
    stats: { strength: 18, dexterity: 12, constitution: 16, intelligence: 14, wisdom: 12, charisma: 14 },
    skills: ['fireball', 'thunder'], expReward: 200, goldReward: 150,
  },
];
