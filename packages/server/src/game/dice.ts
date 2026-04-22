import { DiceType, DiceRoll } from '@trpg/shared';
import { DICE_SIDES } from '@trpg/shared';

function rollSingle(die: DiceType): number {
  return Math.floor(Math.random() * DICE_SIDES[die]) + 1;
}

export function rollDice(die: DiceType, count = 1, modifier = 0): DiceRoll {
  const results = Array.from({ length: count }, () => rollSingle(die));
  return {
    type: die,
    count,
    results,
    total: results.reduce((a, b) => a + b, 0) + modifier,
    modifier,
  };
}
