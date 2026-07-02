'use client';

import { ModifierState } from '@/types/sandbox';
import { clampModifierCount, modifierTotal } from '@/lib/math';
import { NumberInput } from './NumberInput';

type Props = {
  title?: string;
  value: ModifierState;
  onChange: (value: ModifierState) => void;
};

export function ModifierInputs({ title = 'Modificatori', value, onChange }: Props) {
  function set<K extends keyof ModifierState>(key: K, next: number) {
    const safe = key === 'custom' ? next : clampModifierCount(next);
    onChange({ ...value, [key]: safe });
  }

  return (
    <section className="modifierBox">
      <div className="sectionTitleRow">
        <h4>{title}</h4>
        <strong>Total: {modifierTotal(value) >= 0 ? '+' : ''}{modifierTotal(value)}</strong>
      </div>
      <div className="grid six">
        <NumberInput label="AV x +2" value={value.av} min={0} max={2} onChange={(v) => set('av', v)} />
        <NumberInput label="AVM x +4" value={value.avm} min={0} max={2} onChange={(v) => set('avm', v)} />
        <NumberInput label="DV x -2" value={value.dv} min={0} max={2} onChange={(v) => set('dv', v)} />
        <NumberInput label="DVM x -4" value={value.dvm} min={0} max={2} onChange={(v) => set('dvm', v)} />
        <NumberInput label="Custom" value={value.custom} onChange={(v) => set('custom', v)} />
      </div>
      <p className="note">Limita este aplicată automat: maximum 2 avantaje și 2 dezavantaje din fiecare tip.</p>
    </section>
  );
}
