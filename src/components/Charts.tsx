'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { duelByAttributeDelta, EMPTY_MODIFIERS, targetSuccessByBonus, targetSuccessByTarget } from '@/lib/math';
import { NumberInput } from './NumberInput';

export function Charts() {
  const [target, setTarget] = useState(12);
  const [bonus, setBonus] = useState(6);
  const byBonus = useMemo(() => targetSuccessByBonus(target, EMPTY_MODIFIERS, -2, 14), [target]);
  const byTarget = useMemo(() => targetSuccessByTarget(bonus, EMPTY_MODIFIERS, 4, 24), [bonus]);
  const byDelta = useMemo(() => duelByAttributeDelta(6, -8, 8), []);

  return (
    <section className="panel" id="charts">
      <h2>5. Calibrare</h2>
      <div className="grid two">
        <NumberInput label="Țintă pentru grafic bonus" value={target} onChange={setTarget} />
        <NumberInput label="Bonus pentru grafic țintă" value={bonus} onChange={setBonus} />
      </div>
      <div className="chartCard">
        <h3>Șansa de succes în funcție de bonus</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={byBonus}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="bonus" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="success" name="Succes %" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chartCard">
        <h3>Șansa de succes în funcție de țintă</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={byTarget}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="target" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="success" name="Succes %" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chartCard">
        <h3>Roll vs Roll</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={byDelta}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="delta" /><YAxis domain={[0, 100]} /><Tooltip /><Line type="monotone" dataKey="aWins" name="A câștigă %" strokeWidth={2} /><Line type="monotone" dataKey="ties" name="Egal %" strokeWidth={2} /><Line type="monotone" dataKey="bWins" name="B câștigă %" strokeWidth={2} /></LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
