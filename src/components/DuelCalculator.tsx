'use client';

import { useMemo } from 'react';
import { calculateRollVsRoll, D20_VALUES, EMPTY_MODIFIERS, fmtPercent } from '@/lib/math';
import { ModifierState, RollVsRollSide } from '@/types/sandbox';
import { NumberInput } from './NumberInput';
import { ModifierInputs } from './ModifierInputs';
import { StatCards } from './StatCards';

type Props = {
  a: RollVsRollSide;
  setA: (side: RollVsRollSide) => void;
  b: RollVsRollSide;
  setB: (side: RollVsRollSide) => void;
};

function cellClass(result: 'a' | 'tie' | 'b') {
  if (result === 'a') return 'heatA';
  if (result === 'tie') return 'heatTie';
  return 'heatB';
}

export function DuelCalculator({ a, setA, b, setB }: Props) {
  const result = useMemo(() => calculateRollVsRoll(a, b), [a, b]);
  const byRoll = new Map(result.cells.map((cell) => [`${cell.rollA}-${cell.rollB}`, cell]));

  return (
    <section className="panel" id="duel">
      <h2>2. Roll vs Roll</h2>
      <p className="lead">Calcul exact pe toate cele 400 combinații posibile. Fără random, fără Monte Carlo.</p>
      <div className="duelInputs">
        <div className="sideBox">
          <h3>Actor A</h3>
          <input className="nameInput" value={a.label} onChange={(e) => setA({ ...a, label: e.target.value })} />
          <NumberInput label="Bonus A" value={a.bonus} onChange={(bonus) => setA({ ...a, bonus })} />
          <ModifierInputs title="Modificatori A" value={a.modifiers} onChange={(modifiers: ModifierState) => setA({ ...a, modifiers })} />
        </div>
        <div className="sideBox">
          <h3>Actor B</h3>
          <input className="nameInput" value={b.label} onChange={(e) => setB({ ...b, label: e.target.value })} />
          <NumberInput label="Bonus B" value={b.bonus} onChange={(bonus) => setB({ ...b, bonus })} />
          <ModifierInputs title="Modificatori B" value={b.modifiers} onChange={(modifiers: ModifierState) => setB({ ...b, modifiers })} />
        </div>
      </div>
      <StatCards stats={[
        { label: `${a.label || 'Actor A'} câștigă`, value: result.percentages.aWins, tone: 'good' },
        { label: 'Egal', value: result.percentages.ties, tone: 'warn' },
        { label: `${b.label || 'Actor B'} câștigă`, value: result.percentages.bWins, tone: 'bad' },
      ]} />
      <div className="legend"><span className="swatch heatA" /> A câștigă <span className="swatch heatTie" /> Egal <span className="swatch heatB" /> B câștigă</div>
      <div className="heatmapWrap">
        <table className="heatmap">
          <thead>
            <tr><th>A/B</th>{D20_VALUES.map((rollB) => <th key={rollB}>{rollB}</th>)}</tr>
          </thead>
          <tbody>
            {D20_VALUES.map((rollA) => (
              <tr key={rollA}>
                <th>{rollA}</th>
                {D20_VALUES.map((rollB) => {
                  const cell = byRoll.get(`${rollA}-${rollB}`)!;
                  return <td key={rollB} className={cellClass(cell.result)} title={`A: ${cell.finalA}, B: ${cell.finalB}`}>{cell.result === 'a' ? 'A' : cell.result === 'tie' ? '=' : 'B'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <details>
        <summary>Matrice completă 400 combinații</summary>
        <div className="tableWrap compact">
          <table>
            <thead><tr><th>D20 A</th><th>D20 B</th><th>Final A</th><th>Final B</th><th>Rezultat</th></tr></thead>
            <tbody>
              {result.cells.map((cell) => (
                <tr key={`${cell.rollA}-${cell.rollB}`}>
                  <td>{cell.rollA}</td><td>{cell.rollB}</td><td>{cell.finalA}</td><td>{cell.finalB}</td><td>{cell.result === 'a' ? `${a.label} câștigă` : cell.result === 'tie' ? 'Egal' : `${b.label} câștigă`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <button className="ghost" onClick={() => { setA({ ...a, modifiers: EMPTY_MODIFIERS }); setB({ ...b, modifiers: EMPTY_MODIFIERS }); }}>Reset modificatori duel</button>
      <p className="note">Total: {result.counts.aWins} A / {result.counts.ties} egal / {result.counts.bWins} B din 400. Procente: {fmtPercent(result.percentages.aWins)} / {fmtPercent(result.percentages.ties)} / {fmtPercent(result.percentages.bWins)}.</p>
    </section>
  );
}
