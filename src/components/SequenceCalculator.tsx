'use client';

import { useMemo, useState } from 'react';
import { ModifierState } from '@/types/sandbox';
import { D20_VALUES, EMPTY_MODIFIERS, finalScore, fmtPercent } from '@/lib/math';
import { ModifierInputs } from './ModifierInputs';
import { NumberInput } from './NumberInput';

type StepType = 'target' | 'duel' | 'interceptionVsPass';

type SequenceStep = {
  id: string;
  name: string;
  type: StepType;
  bonus: number;
  modifiers: ModifierState;
  target: number;
  opponentBonus: number;
  opponentModifiers: ModifierState;
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
      type: 'duel',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 15,
      opponentBonus: 4,
      opponentModifiers: freshModifiers(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Lovitură de cap',
      type: 'target',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 15,
      opponentBonus: 4,
      opponentModifiers: freshModifiers(),
    },
    {
      id: crypto.randomUUID(),
      name: 'Finalizare',
      type: 'target',
      bonus: 4,
      modifiers: freshModifiers(),
      target: 15,
      opponentBonus: 4,
      opponentModifiers: freshModifiers(),
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
    const outcomesThisStep = step.type === 'duel' ? 400 : 20;
    totalWays *= outcomesThisStep;

    for (const branch of branches) {
      if (step.type === 'duel') {
        for (const rollA of D20_VALUES) {
          for (const rollB of D20_VALUES) {
            const scoreA = finalScore(rollA, step.bonus, step.modifiers);
            const scoreB = finalScore(rollB, step.opponentBonus, step.opponentModifiers);

            if (scoreA > scoreB) {
              nextBranches.push({ previousScore: scoreA, ways: branch.ways });
            }
          }
        }
      } else if (step.type === 'interceptionVsPass') {
        for (const roll of D20_VALUES) {
          const interceptionScore = finalScore(roll, step.bonus, step.modifiers);
          const passContinues = interceptionScore <= step.target;

          // Atipic: aici pasul reușește pentru lanț dacă intercepția pierde.
          // Ținta reprezintă valoarea pasei, iar bonusul/modificatorii sunt ai intercepției.
          if (passContinues) {
            nextBranches.push({ previousScore: step.target, ways: branch.ways });
          }
        }
      } else {
        for (const roll of D20_VALUES) {
          const score = finalScore(roll, step.bonus, step.modifiers);
          const passes = score > step.target;

          if (passes) {
            nextBranches.push({ previousScore: score, ways: branch.ways });
          }
        }
      }
    }

    const passedWays = nextBranches.reduce((sum, branch) => sum + branch.ways, 0);
    results.push({
      step,
      enteredWays,
      passedWays,
      totalWays,
      conditionalPercent: enteredWays ? (passedWays / (enteredWays * outcomesThisStep)) * 100 : 0,
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

  function updateOpponentModifiers(id: string, opponentModifiers: ModifierState) {
    updateStep(id, { opponentModifiers });
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
        target: 15,
        opponentBonus: 4,
        opponentModifiers: freshModifiers(),
      },
    ]);
  }

  function removeStep(id: string) {
    setSteps((current) => current.length <= 1 ? current : current.filter((step) => step.id !== id));
  }

  function resetCrossPreset() {
    setSteps(defaultSteps());
  }

  function resetPassDribblePreset() {
    setSteps([
      {
        id: crypto.randomUUID(),
        name: 'Pasă',
        type: 'interceptionVsPass',
        bonus: 4,
        modifiers: freshModifiers(),
        target: 15,
        opponentBonus: 4,
        opponentModifiers: freshModifiers(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Dribling',
        type: 'duel',
        bonus: 4,
        modifiers: freshModifiers(),
        target: 15,
        opponentBonus: 4,
        opponentModifiers: freshModifiers(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Finalizare',
        type: 'target',
        bonus: 4,
        modifiers: freshModifiers(),
        target: 15,
        opponentBonus: 4,
        opponentModifiers: freshModifiers(),
      },
    ]);
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
        <button onClick={resetPassDribblePreset}>Preset pasă-dribling-finalizare</button>
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
                  <option value="duel">Roll vs Roll</option>
                  <option value="interceptionVsPass">Intercepție vs Pasă</option>
                </select>
              </label>
            </div>

            <div className="grid two">
              <NumberInput
                label={step.type === 'interceptionVsPass' ? 'Bonus intercepție' : 'Bonus'}
                value={step.bonus}
                onChange={(value) => updateStep(step.id, { bonus: value })}
              />
              {step.type === 'duel' ? (
                <NumberInput label="Bonus al doilea roll" value={step.opponentBonus} onChange={(value) => updateStep(step.id, { opponentBonus: value })} />
              ) : (
                <NumberInput
                  label={step.type === 'interceptionVsPass' ? 'Valoare pasă' : 'Țintă'}
                  value={step.target}
                  onChange={(value) => updateStep(step.id, { target: value })}
                />
              )}
            </div>

            <ModifierInputs title={step.type === 'interceptionVsPass' ? `Modificatori intercepție ${step.name || `pas ${index + 1}`}` : `Modificatori ${step.name || `pas ${index + 1}`}`} value={step.modifiers} onChange={(value) => updateStepModifiers(step.id, value)} />

            {step.type === 'duel' && (
              <ModifierInputs title={`Modificatori al doilea roll ${step.name || `pas ${index + 1}`}`} value={step.opponentModifiers} onChange={(value) => updateOpponentModifiers(step.id, value)} />
            )}

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
