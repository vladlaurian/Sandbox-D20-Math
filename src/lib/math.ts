import { CheckResult, DuelResult, ModifierState, RollVsRollSide, RollVsTargetInput } from '@/types/sandbox';

export const D20_VALUES = Array.from({ length: 20 }, (_, i) => i + 1);

export const EMPTY_MODIFIERS: ModifierState = {
  av: 0,
  avm: 0,
  dv: 0,
  dvm: 0,
  custom: 0,
};

export function clampModifierCount(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(2, Math.trunc(value)));
}

export function modifierTotal(modifiers: ModifierState): number {
  return (
    clampModifierCount(modifiers.av) * 2 +
    clampModifierCount(modifiers.avm) * 4 -
    clampModifierCount(modifiers.dv) * 2 -
    clampModifierCount(modifiers.dvm) * 4 +
    Number(modifiers.custom || 0)
  );
}

export function finalScore(roll: number, bonus: number, modifiers: ModifierState): number {
  return roll + Number(bonus || 0) + modifierTotal(modifiers);
}

export function classifyTarget(finalValue: number, target: number): CheckResult {
  if (finalValue > target) return 'success';
  if (finalValue === target) return 'tie';
  return 'failure';
}

export function calculateRollVsTarget(input: RollVsTargetInput) {
  const rows = D20_VALUES.map((roll) => {
    const value = finalScore(roll, input.bonus, input.modifiers);
    const result = classifyTarget(value, input.target);
    return { roll, final: value, result };
  });

  const success = rows.filter((r) => r.result === 'success').length;
  const tie = rows.filter((r) => r.result === 'tie').length;
  const failure = rows.filter((r) => r.result === 'failure').length;

  return {
    rows,
    counts: { success, tie, failure },
    percentages: {
      success: success / 20 * 100,
      tie: tie / 20 * 100,
      failure: failure / 20 * 100,
    },
  };
}

export function classifyDuel(a: number, b: number): DuelResult {
  if (a > b) return 'a';
  if (a === b) return 'tie';
  return 'b';
}

export function calculateRollVsRoll(a: RollVsRollSide, b: RollVsRollSide) {
  const cells = D20_VALUES.flatMap((rollA) =>
    D20_VALUES.map((rollB) => {
      const finalA = finalScore(rollA, a.bonus, a.modifiers);
      const finalB = finalScore(rollB, b.bonus, b.modifiers);
      return {
        rollA,
        rollB,
        finalA,
        finalB,
        result: classifyDuel(finalA, finalB),
      };
    })
  );

  const aWins = cells.filter((c) => c.result === 'a').length;
  const ties = cells.filter((c) => c.result === 'tie').length;
  const bWins = cells.filter((c) => c.result === 'b').length;

  return {
    cells,
    counts: { aWins, ties, bWins },
    percentages: {
      aWins: aWins / 400 * 100,
      ties: ties / 400 * 100,
      bWins: bWins / 400 * 100,
    },
  };
}

export function targetSuccessByBonus(target: number, modifiers: ModifierState, min = -2, max = 12) {
  return Array.from({ length: max - min + 1 }, (_, idx) => {
    const bonus = min + idx;
    const p = calculateRollVsTarget({ bonus, target, modifiers }).percentages;
    return { bonus, success: p.success, tie: p.tie, failure: p.failure };
  });
}

export function targetSuccessByTarget(bonus: number, modifiers: ModifierState, min = 4, max = 24) {
  return Array.from({ length: max - min + 1 }, (_, idx) => {
    const target = min + idx;
    const p = calculateRollVsTarget({ bonus, target, modifiers }).percentages;
    return { target, success: p.success, tie: p.tie, failure: p.failure };
  });
}

export function duelByAttributeDelta(baseB = 6, minDelta = -8, maxDelta = 8) {
  return Array.from({ length: maxDelta - minDelta + 1 }, (_, idx) => {
    const delta = minDelta + idx;
    const a: RollVsRollSide = { label: 'Actor A', bonus: baseB + delta, modifiers: EMPTY_MODIFIERS };
    const b: RollVsRollSide = { label: 'Actor B', bonus: baseB, modifiers: EMPTY_MODIFIERS };
    const p = calculateRollVsRoll(a, b).percentages;
    return { delta, aWins: p.aWins, ties: p.ties, bWins: p.bWins };
  });
}

export function fmtPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}
