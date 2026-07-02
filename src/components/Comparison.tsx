'use client';

import { useMemo, useState } from 'react';
import { calculateRollVsTarget, EMPTY_MODIFIERS, fmtPercent } from '@/lib/math';
import { ModifierInputs } from './ModifierInputs';
import { NumberInput } from './NumberInput';

export function Comparison() {
  const [bonusesText, setBonusesText] = useState('-3, -2, -1, 0, +1, +2, +3, +4, +5, +6, +7, +8');
  const [target, setTarget] = useState(12);
  const [modifiers, setModifiers] = useState(EMPTY_MODIFIERS);

  const rows = useMemo(() => bonusesText
    .split(',')
    .map((x) => Number(x.trim().replace('+', '')))
    .filter((x) => !Number.isNaN(x))
    .map((bonus) => ({ bonus, ...calculateRollVsTarget({ bonus, target, modifiers }).percentages })), [bonusesText, target, modifiers]);

  return (
    <section className="panel" id="compare">
      <h2>3. Comparare carduri vs aceeași țintă</h2>
      <div className="grid two">
        <label className="field"><span>Bonusuri separate prin virgulă</span><input value={bonusesText} onChange={(e) => setBonusesText(e.target.value)} /></label>
        <NumberInput label="Țintă" value={target} onChange={setTarget} />
      </div>
      <ModifierInputs value={modifiers} onChange={setModifiers} />
      <div className="tableWrap">
        <table>
          <thead><tr><th>Bonus</th><th>Succes</th><th>Egal</th><th>Eșec</th><th>Dif față de anterior</th></tr></thead>
          <tbody>
            {rows.map((row, idx) => {
              const prev = rows[idx - 1];
              return <tr key={`${row.bonus}-${idx}`}><td>{row.bonus >= 0 ? '+' : ''}{row.bonus}</td><td>{fmtPercent(row.success)}</td><td>{fmtPercent(row.tie)}</td><td>{fmtPercent(row.failure)}</td><td>{prev ? `${(row.success - prev.success).toFixed(1)} pp` : '-'}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
