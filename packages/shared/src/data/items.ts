import { Item } from '../types';

export const DEFAULT_ITEMS: Item[] = [
  { id: 'iron_sword', name: '鐵劍', description: '基本的鐵製長劍', type: 'weapon', effect: { stat: 'strength', value: 1 } },
  { id: 'steel_sword', name: '鋼劍', description: '鍛造精良的鋼劍', type: 'weapon', effect: { stat: 'strength', value: 2 } },
  { id: 'magic_staff', name: '魔法杖', description: '蘊含魔力的法杖', type: 'weapon', effect: { stat: 'intelligence', value: 2 } },
  { id: 'dagger', name: '匕首', description: '輕巧的匕首', type: 'weapon', effect: { stat: 'dexterity', value: 2 } },
  { id: 'leather_armor', name: '皮甲', description: '輕便的皮革護甲', type: 'armor', effect: { stat: 'dexterity', value: 1 } },
  { id: 'chain_mail', name: '鎖子甲', description: '堅固的鎖子甲', type: 'armor', effect: { stat: 'constitution', value: 2 } },
  { id: 'mage_robe', name: '法師袍', description: '增強魔力的法師袍', type: 'armor', effect: { stat: 'intelligence', value: 1 } },
  { id: 'ring_of_power', name: '力量之戒', description: '增強力量的魔法戒指', type: 'misc', effect: { stat: 'strength', value: 1 } },
  { id: 'amulet_of_wisdom', name: '智慧護符', description: '提升智慧的護符', type: 'misc', effect: { stat: 'wisdom', value: 2 } },
  { id: 'health_potion', name: '生命藥水', description: '恢復少量生命值', type: 'potion' },
  { id: 'mana_potion', name: '魔力藥水', description: '恢復少量魔力值', type: 'potion' },
  { id: 'old_key', name: '古老鑰匙', description: '一把神秘的古老鑰匙', type: 'misc' },
];
