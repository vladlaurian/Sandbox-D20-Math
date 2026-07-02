export type CheckResult = 'success' | 'tie' | 'failure';
export type DuelResult = 'a' | 'tie' | 'b';

export type ModifierState = {
  av: number;
  avm: number;
  dv: number;
  dvm: number;
  custom: number;
};

export type RollVsTargetInput = {
  bonus: number;
  target: number;
  modifiers: ModifierState;
};

export type RollVsRollSide = {
  label: string;
  bonus: number;
  modifiers: ModifierState;
};

export type Preset = {
  name: string;
  mode: 'target' | 'duel';
  aLabel: string;
  bLabel?: string;
  defaultTarget?: number;
};
