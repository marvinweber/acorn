import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../i18n';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];

export interface AllocationSlice {
  name: string;
  value: number;
}

interface Props {
  data: AllocationSlice[];
  emptyLabel?: string;
}

export function AllocationChart({ data, emptyLabel = 'No data' }: Props) {
  const filtered = data.filter(d => d.value > 0);

  if (filtered.length === 0) {
    return (
      <div className="h-50 flex items-center justify-center text-text-secondary text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="42%"
          outerRadius={65}
          dataKey="value"
          strokeWidth={0}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: '#9ca3af', fontSize: 11 }}>{value}</span>
          )}
        />
        <Tooltip
          contentStyle={{
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v, name) => [formatCurrency(v as number), name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
