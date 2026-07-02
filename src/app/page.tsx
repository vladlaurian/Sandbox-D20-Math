'use client';

import { useState } from 'react';
import { Charts } from '@/components/Charts';
import { Comparison } from '@/components/Comparison';
import { DuelCalculator } from '@/components/DuelCalculator';
import { TargetCalculator } from '@/components/TargetCalculator';
import { SequenceCalculator } from '@/components/SequenceCalculator';
import { EMPTY_MODIFIERS } from '@/lib/math';
import { PRESETS } from '@/lib/presets';
import { RollVsRollSide } from '@/types/sandbox';

export default function Home() {
  const [targetBonus, setTargetBonus] = useState(4);
  const [target, setTarget] = useState(15);
  const [targetModifiers, setTargetModifiers] = useState(EMPTY_MODIFIERS);
  const [a, setA] = useState<RollVsRollSide>({ label: 'Actor A', bonus: 6, modifiers: EMPTY_MODIFIERS });
  const [b, setB] = useState<RollVsRollSide>({ label: 'Actor B', bonus: 6, modifiers: EMPTY_MODIFIERS });

  function applyPreset(name: string) {
    const preset = PRESETS.find((p) => p.name === name);
    if (!preset) return;
    if (preset.mode === 'target') {
      setTarget(preset.defaultTarget ?? 15);
      setTargetBonus(4);
      setTargetModifiers(EMPTY_MODIFIERS);
      document.getElementById('target')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setA({ label: preset.aLabel, bonus: 6, modifiers: EMPTY_MODIFIERS });
      setB({ label: preset.bLabel ?? 'Actor B', bonus: 6, modifiers: EMPTY_MODIFIERS });
      document.getElementById('duel')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">D20 Football Board Game</p>
          <h1>Mathematical Sandbox</h1>
          <p>Calculator exact pentru calibrarea cardurilor: Roll vs Target, Roll vs Roll, matrice 20×20, heatmap, comparații, succesiuni și calibrare.</p>
        </div>
        <nav>
          <a href="#target">Target</a><a href="#duel">Duel</a><a href="#compare">Comparații</a><a href="#sequence">Succesiuni</a><a href="#charts">Calibrare</a>
        </nav>
      </header>

      <section className="panel presetPanel">
        <h2>Preseturi rapide</h2>
        <div className="presetGrid">
          {PRESETS.map((preset) => <button key={preset.name} onClick={() => applyPreset(preset.name)}>{preset.name}</button>)}
        </div>
      </section>

      <TargetCalculator bonus={targetBonus} setBonus={setTargetBonus} target={target} setTarget={setTarget} modifiers={targetModifiers} setModifiers={setTargetModifiers} />
      <DuelCalculator a={a} setA={setA} b={b} setB={setB} />
      <Comparison />
      <SequenceCalculator />
      <Charts />
    </main>
  );
}
