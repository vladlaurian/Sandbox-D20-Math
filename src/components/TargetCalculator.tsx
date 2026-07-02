'use client';

import { useMemo } from 'react';
import { calculateRollVsTarget, EMPTY_MODIFIERS } from '@/lib/math';
import { ModifierState } from '@/types/sandbox';
import { NumberInput } from './NumberInput';
import { ModifierInputs } from './ModifierInputs';
import { StatCards } from './StatCards';

type Props = {
  bonus: number;
  setBonus: (n: number) => void;
  target: number;
  setTarget: (n: number) => void;
  modifiers: ModifierState;
  setModifiers: (m: ModifierState) => void;
};

export function TargetCalculator({ bonus, setBonus, target, setTarget, modifiers, setModifiers }: Props) {
  const result = useMemo(() => calculateRollVsTarget({ bonus, target, modifiers }), [bonus, target, modifiers]);

  return (
    <section className="panel" id="target">
      <h2>1. Roll vs Target</h2>
      <p className="lead">D20 + Bonus + Modificatori comparat cu o țintă fixă. Natural 1 și 20 nu au reguli speciale.</p>
      <div className="grid two">
        <NumberInput label="Bonus" value={bonus} onChange={setBonus} />
        <NumberInput label="Țintă fixă" value={target} onChange={setTarget} />
      </div>
      <ModifierInputs value={modifiers} onChange={setModifiers} />
      <StatCards stats={[
        { label: 'Succes', value: result.percentages.success, tone: 'good' },
        { label: 'Egal', value: result.percentages.tie, tone: 'warn' },
        { label: 'Eșec', value: result.percentages.failure, tone: 'bad' },
      ]} />
      <div className="tableWrap">
        <table>
          <thead><tr><th>D20</th><th>Rezultat final</th><th>Outcome</th></tr></thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.roll} className={row.result}>
                <td>{row.roll}</td><td>{row.final}</td><td>{row.result === 'success' ? 'Succes' : row.result === 'tie' ? 'Egal' : 'Eșec'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="ghost" onClick={() => setModifiers(EMPTY_MODIFIERS)}>Reset modificatori</button>
    </section>
  );
}
