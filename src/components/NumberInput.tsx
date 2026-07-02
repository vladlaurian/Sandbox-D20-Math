'use client';

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
};

export function NumberInput({ label, value, onChange, min, max, step = 1, hint }: Props) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
