import { Stats } from '../types';

export interface Skill {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  target: 'enemy' | 'self' | 'ally' | 'all_enemies';
  damageType: 'physical' | 'magical' | 'heal';
  power: number;
  attribute: keyof Stats;
}

export const DEFAULT_SKILLS: Skill[] = [
  { id: 'fireball', name: '火球術', description: '釋放火焰攻擊敵人', mpCost: 5, target: 'enemy', damageType: 'magical', power: 4, attribute: 'intelligence' },
  { id: 'heal', name: '治療術', description: '恢復自身生命值', mpCost: 4, target: 'self', damageType: 'heal', power: 3, attribute: 'wisdom' },
  { id: 'power_strike', name: '強力打擊', description: '全力揮擊造成額外傷害', mpCost: 3, target: 'enemy', damageType: 'physical', power: 3, attribute: 'strength' },
  { id: 'ice_shard', name: '冰錐術', description: '射出冰錐刺穿敵人', mpCost: 4, target: 'enemy', damageType: 'magical', power: 3, attribute: 'intelligence' },
  { id: 'sneak_attack', name: '偷襲', description: '趁敵人不備發動攻擊', mpCost: 3, target: 'enemy', damageType: 'physical', power: 4, attribute: 'dexterity' },
  { id: 'group_heal', name: '群體治療', description: '恢復全體隊友生命', mpCost: 8, target: 'ally', damageType: 'heal', power: 2, attribute: 'wisdom' },
  { id: 'thunder', name: '雷擊', description: '召喚雷電攻擊所有敵人', mpCost: 7, target: 'all_enemies', damageType: 'magical', power: 3, attribute: 'intelligence' },
  { id: 'shield_bash', name: '盾擊', description: '用盾牌猛擊敵人', mpCost: 2, target: 'enemy', damageType: 'physical', power: 2, attribute: 'strength' },
];
