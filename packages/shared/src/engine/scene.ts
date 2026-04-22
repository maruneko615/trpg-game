import { Scene, SceneOption, SceneEvent, Character } from '../types';
import { skillCheck, rollSingle } from './dice';
import { effectiveStat } from './character';
import { statModifier } from './dice';

export interface OptionResult {
  success: boolean;
  nextSceneId: string;
  message: string;
}

export function resolveOption(
  option: SceneOption,
  char: Character,
  rng: () => number = Math.random,
): OptionResult {
  if (option.requiredItem && !char.inventory.some(i => i.id === option.requiredItem)) {
    return { success: false, nextSceneId: '', message: `Missing required item: ${option.requiredItem}` };
  }

  if (option.check) {
    const attrVal = effectiveStat(char, option.check.attribute);
    const mod = statModifier(attrVal);
    const result = skillCheck(option.check.attribute, attrVal, option.check.dc, rng);
    if (!result.success && !result.critical) {
      return { success: false, nextSceneId: '', message: `${option.check.attribute} check failed (rolled ${result.roll}+${mod} vs DC ${option.check.dc}).` };
    }
  }

  return { success: true, nextSceneId: option.nextSceneId, message: 'Success.' };
}

export function rollRandomEvent(
  scene: Scene,
  rng: () => number = Math.random,
): SceneEvent | null {
  if (!scene.randomEvents || scene.randomEvents.length === 0) return null;
  const idx = rollSingle(scene.randomEvents.length, rng) - 1;
  return scene.randomEvents[idx];
}

export function findScene(scenes: Scene[], id: string): Scene | undefined {
  return scenes.find(s => s.id === id);
}

export function availableOptions(scene: Scene, char: Character): SceneOption[] {
  return (scene.options ?? []).filter(o => !o.requiredItem || char.inventory.some(i => i.id === o.requiredItem));
}
