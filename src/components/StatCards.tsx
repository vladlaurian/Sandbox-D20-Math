import { fmtPercent } from '@/lib/math';

type Stat = { label: string; value: number; tone?: 'good' | 'warn' | 'bad' | 'neutral' };

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="statGrid">
      {stats.map((stat) => (
        <div className={`statCard ${stat.tone ?? 'neutral'}`} key={stat.label}>
          <span>{stat.label}</span>
          <strong>{fmtPercent(stat.value)}</strong>
        </div>
      ))}
    </div>
  );
}
