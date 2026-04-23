interface Props {
  value: number;
  max: number;
  className?: string;
}

export function ProgressBar({ value, max, className = '' }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`h-2 bg-[#374151] rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full bg-brand rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
