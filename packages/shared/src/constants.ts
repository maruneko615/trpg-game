import { DiceType, Stats } from './types';

export const DICE_SIDES: Record<DiceType, number> = {
  d4: 4, d6: 6, d8: 8, d10: 10, d12: 12, d20: 20, d100: 100,
};

export const DEFAULT_STATS: Stats = {
  strength: 10, dexterity: 10, constitution: 10,
  intelligence: 10, wisdom: 10, charisma: 10,
};

export const STAT_POINT_POOL = 27;
export const MAX_STAT = 20;
export const MIN_STAT = 3;

export const BASE_HP = 10;
export const HP_PER_LEVEL = 6;
export const BASE_MP = 5;
export const MP_PER_LEVEL = 3;

export const XP_PER_LEVEL = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000];

export const SOCKET_EVENTS = {
  JOIN_SESSION: 'join-session',
  LEAVE_SESSION: 'leave-session',
  ROLL_DICE: 'roll-dice',
  CHAT_MESSAGE: 'chat-message',
  COMBAT_ACTION: 'combat-action',
  SCENE_UPDATE: 'scene-update',
  SESSION_STATE: 'session-state',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  DICE_RESULT: 'dice-result',
  COMBAT_UPDATE: 'combat-update',
  ERROR: 'error',
} as const;
