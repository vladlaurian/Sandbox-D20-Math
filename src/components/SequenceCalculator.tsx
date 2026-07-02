'use client';

import { useMemo, useState } from 'react';
import { ModifierState } from '@/types/sandbox';
import { D20_VALUES, EMPTY_MODIFIERS, finalScore, fmtPercent } from '@/lib/math';
import { ModifierInputs } from './ModifierInputs';
import { NumberInput } from './NumberInput';

type StepType = 'target' | 'previous';
type PreviousPassMode = 'beat' | 'notBeat';

type SequenceStep = {
  id: string;
  name: string;
  type: StepType;
  bonus: number;
  modifiers: ModifierState;
  target: number;
  previousPassMode: PreviousPassMode;
};

type Branch = {
  previousScore: number;
  ways: number;
};

type StepResult = {
  step: SequenceStep;
  enteredWays: number;
  passedWays: number;
  totalWays: number;
  conditionalPercent: number;
  cumulativePercent: number;
};

function freshModifiers(): ModifierState {
  return { ...EMPTY_MODIFIERS };
}

function defaultSteps(): SequenceStep[] {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Centrare',
      type: 'target',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 8,
      previousPassMode: 'beat',
    },
    {
      id: crypto.randomUUID(),
      name: 'Portar',
      type: 'previous',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 8,
      previousPassMode: 'notBeat',
    },
    {
      id: crypto.randomUUID(),
      name: 'Lovitură de cap',
      type: 'target',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 8,
      previousPassMode: 'beat',
    },
    {
      id: crypto.randomUUID(),
      name: 'Finalizare',
      type: 'target',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 8,
      previousPassMode: 'beat',
    },
  ];
}

function mergeBranches(branches: Branch[]): Branch[] {
  const map = new Map<number, number>();
  for (const branch of branches) {
    map.set(branch.previousScore, (map.get(branch.previousScore) ?? 0) + branch.ways);
  }
  return Array.from(map.entries()).map(([previousScore, ways]) => ({ previousScore, ways }));
}

function calculateSequence(steps: SequenceStep[]): StepResult[] {
  let branches: Branch[] = [{ previousScore: 0, ways: 1 }];
  let totalWays = 1;
  const results: StepResult[] = [];

  for (const step of steps) {
    const enteredWays = branches.reduce((sum, branch) => sum + branch.ways, 0);
    const nextBranches: Branch[] = [];
    totalWays *= 20;

    for (const branch of branches) {
      for (const roll of D20_VALUES) {
        const score = finalScore(roll, step.bonus, step.modifiers);
        let passes = false;
        let nextPreviousScore = score;

        if (step.type === 'target') {
          passes = score > step.target;
        } else {
          const beatsPrevious = score > branch.previousScore;
          passes = step.previousPassMode === 'beat' ? beatsPrevious : !beatsPrevious;
          nextPreviousScore = step.previousPassMode === 'beat' ? score : branch.previousScore;
        }

        if (passes) {
          nextBranches.push({ previousScore: nextPreviousScore, ways: branch.ways });
        }
      }
    }

    const passedWays = nextBranches.reduce((sum, branch) => sum + branch.ways, 0);
    results.push({
      step,
      enteredWays,
      passedWays,
      totalWays,
      conditionalPercent: enteredWays ? (passedWays / (enteredWays * 20)) * 100 : 0,
      cumulativePercent: (passedWays / totalWays) * 100,
    });

    branches = mergeBranches(nextBranches);
  }

  return results;
}

export function SequenceCalculator() {
  const [steps, setSteps] = useState<SequenceStep[]>(defaultSteps);
  const results = useMemo(() => calculateSequence(steps), [steps]);
  const finalPercent = results.at(-1)?.cumulativePercent ?? 0;

  function updateStep(id: string, patch: Partial<SequenceStep>) {
    setSteps((current) => current.map((step) => step.id === id ? { ...step, ...patch } : step));
  }

  function updateStepModifiers(id: string, modifiers: ModifierState) {
    updateStep(id, { modifiers });
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: `Pas ${current.length + 1}`,
        type: 'target',
        bonus: 4,
        modifiers: freshModifiers(),
        target: 8,
        previousPassMode: 'beat',
      },
    ]);
  }

  function removeStep(id: string) {
    setSteps((current) => current.length <= 1 ? current : current.filter((step) => step.id !== id));
  }

  function resetCrossPreset() {
    setSteps(defaultSteps());
  }

  return (
    <section className="panel" id="sequence">
      <div className="sectionTitleRow">
        <div>
          <h2>4. Calculator de succesiuni</h2>
          <p className="lead">Calculează exact șansa finală pentru un lanț de acțiuni. Poți modifica fiecare pas și îl poți folosi pentru orice succesiune, nu doar pentru centrare.</p>
        </div>
        <strong className="finalBadge">Succes final: {fmtPercent(finalPercent)}</strong>
      </div>

      <div className="sequenceActions">
        <button onClick={addStep}>+ Adaugă pas</button>
        <button onClick={resetCrossPreset}>Preset centrare</button>
      </div>

      {steps.map((step, index) => {
        const result = results[index];
        return (
          <section className="sequenceStep" key={step.id}>
            <div className="sectionTitleRow">
              <h3>Pasul {index + 1}: {step.name || 'Fără nume'}</h3>
              <button className="ghost" onClick={() => removeStep(step.id)} disabled={steps.length <= 1}>Șterge pas</button>
            </div>

            <div className="grid two">
              <label className="field">
                <span>Nume pas</span>
                <input value={step.name} onChange={(e) => updateStep(step.id, { name: e.target.value })} />
              </label>

              <label className="field">
                <span>Tip pas</span>
                <select value={step.type} onChange={(e) => updateStep(step.id, { type: e.target.value as StepType })}>
                  <option value="target">Roll vs Țintă</option>
                  <option value="previous">Roll vs Scorul anterior</option>
                </select>
              </label>
            </div>

            <div className="grid two">
              <NumberInput label="Bonus" value={step.bonus} onChange={(value) => updateStep(step.id, { bonus: value })} />
              {step.type === 'target' ? (
                <NumberInput label="Țintă" value={step.target} onChange={(value) => updateStep(step.id, { target: value })} />
              ) : (
                <label className="field">
                  <span>Condiție de trecere</span>
                  <select value={step.previousPassMode} onChange={(e) => updateStep(step.id, { previousPassMode: e.target.value as PreviousPassMode })}>
                    <option value="beat">Pasul reușește dacă depășește scorul anterior</option>
                    <option value="notBeat">Pasul reușește dacă NU depășește scorul anterior</option>
                  </select>
                </label>
              )}
            </div>

            <ModifierInputs title={`Modificatori ${step.name || `pas ${index + 1}`}`} value={step.modifiers} onChange={(value) => updateStepModifiers(step.id, value)} />

            <div className="sequenceResultGrid">
              <div className="statCard">
                <span>Șansa acestui pas</span>
                <strong>{fmtPercent(result?.conditionalPercent ?? 0)}</strong>
              </div>
              <div className="statCard good">
                <span>Șansa totală până aici</span>
                <strong>{fmtPercent(result?.cumulativePercent ?? 0)}</strong>
              </div>
            </div>
          </section>
        );
      })}

      <div className="sequenceFunnel">
        <div className="funnelItem"><span>Start</span><strong>100%</strong></div>
        {results.map((result, index) => (
          <div className="funnelItem" key={result.step.id}>
            <span>{index + 1}. {result.step.name || 'Pas'}</span>
            <strong>{fmtPercent(result.cumulativePercent)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
