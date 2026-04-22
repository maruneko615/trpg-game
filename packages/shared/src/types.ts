export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: Stats;
  skills: string[];
  inventory: Item[];
  experience: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'potion' | 'consumable' | 'accessory' | 'misc';
  effect?: { stat: keyof Stats; value: number };
}

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export interface DiceRoll {
  type: DiceType;
  count: number;
  modifier: number;
  results: number[];
  total: number;
}

export interface SceneOption {
  id: string;
  text: string;
  nextSceneId: string;
  requiredItem?: string;
  check?: { attribute: keyof Stats; dc: number };
}

export interface SceneEvent {
  id: string;
  description: string;
  probability: number;
}

export interface Scene {
  id: string;
  description: string;
  choices: Choice[];
  enemies: Enemy[];
  options?: SceneOption[];
  randomEvents?: SceneEvent[];
}

export interface Choice {
  id: string;
  text: string;
  requiredCheck?: { stat: keyof Stats; dc: number };
  nextSceneId?: string;
}

export interface Enemy {
  id: string;
  name: string;
  level?: number;
  hp: number;
  maxHp: number;
  description?: string;
  stats: Stats;
  attributes?: Stats;
  skills: string[];
  expReward?: number;
  goldReward?: number;
}

export interface GameSession {
  id: string;
  name: string;
  players: Character[];
  currentScene: Scene | null;
  gameLog: ChatMessage[];
  state: 'lobby' | 'playing' | 'combat' | 'ended';
}

export type MessageType = 'chat' | 'system' | 'dice' | 'action' | 'narrative';

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  type: MessageType;
}

export interface CombatState {
  turnOrder: string[];
  currentTurnIndex: number;
  round: number;
}
