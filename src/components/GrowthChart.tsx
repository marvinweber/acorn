import { useMemo } from 'react';
import { startOfDay } from 'date-fns';
import {
  ComposedChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
  useXAxisScale, useYAxisScale, usePlotArea,
} from 'recharts';
import { calcChartSeries } from '../calculations';
import type { ChartDataPoint } from '../calculations';
import type { SavingsPlan, Deposit, Withdrawal } from '../types';
import { t, formatCurrency } from '../i18n';


function pts2path(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
}

// Split into green/red path segments, interpolating exact zero-crossing position
function coloredSegments(
  pts: { x: number; y: number; v: number }[],
  zeroY: number,
): { d: string; color: string }[] {
  if (pts.length < 2) return [];
  const out: { d: string; color: string }[] = [];
  let cur: { x: number; y: number }[] = [{ x: pts[0].x, y: pts[0].y }];
  let color = pts[0].v >= 0 ? '#16a34a' : '#ef4444';

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1], p = pts[i];
    if ((prev.v >= 0) !== (p.v >= 0)) {
      const t = Math.abs(prev.v) / (Math.abs(prev.v) + Math.abs(p.v));
      const cx = prev.x + t * (p.x - prev.x);
      cur.push({ x: cx, y: zeroY });
      out.push({ d: pts2path(cur), color });
      color = p.v >= 0 ? '#16a34a' : '#ef4444';
      cur = [{ x: cx, y: zeroY }];
    }
    cur.push({ x: p.x, y: p.y });
  }
  if (cur.length >= 2) out.push({ d: pts2path(cur), color });
  return out;
}

// Rendered as a direct child of ComposedChart.
// Uses recharts v3 hooks to access chart context (scale functions + plot area).
function ChartLines({ data }: { data: ChartDataPoint[]; yMin: number; yMax: number }) {
  const xScale   = useXAxisScale();
  const yScale   = useYAxisScale();
  const plotArea = usePlotArea();

  if (!xScale || !yScale || !plotArea) return null;

  const { y: T, height: H } = plotArea;

  const getX = (date: string): number | undefined => xScale(date, { position: 'middle' }) as number | undefined;
  const getY = (v: number): number | undefined    => yScale(v) as number | undefined;

  const zeroY    = getY(0) ?? (T + H);
  const zeroFrac = H > 0 ? ((zeroY - T) / H * 100).toFixed(2) + '%' : '100%';

  const toPoint = (d: ChartDataPoint, key: 'balance' | 'projected') => {
    const v = d[key];
    if (v === undefined) return null;
    const x = getX(d.date);
    const y = getY(v);
    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return null;
    return { x, y, v };
  };

  const histPts = data.flatMap(d => { const p = toPoint(d, 'balance');   return p ? [p] : []; });
  const projPts = data.flatMap(d => { const p = toPoint(d, 'projected'); return p ? [p] : []; });
  const histSegs = coloredSegments(histPts, zeroY);

  return (
    <g>
      <defs>
        <linearGradient id="hfill" gradientUnits="userSpaceOnUse" x1="0" y1={T} x2="0" y2={T + H}>
          <stop offset="0%"       stopColor="#16a34a" stopOpacity={0.30} />
          <stop offset={zeroFrac} stopColor="#16a34a" stopOpacity={0}    />
          <stop offset={zeroFrac} stopColor="#ef4444" stopOpacity={0}    />
          <stop offset="100%"     stopColor="#ef4444" stopOpacity={0.40} />
        </linearGradient>
        <linearGradient id="pfill" gradientUnits="userSpaceOnUse" x1="0" y1={T} x2="0" y2={T + H}>
          <stop offset="0%"       stopColor="#3b82f6" stopOpacity={0.20} />
          <stop offset={zeroFrac} stopColor="#3b82f6" stopOpacity={0}    />
          <stop offset={zeroFrac} stopColor="#ef4444" stopOpacity={0}    />
          <stop offset="100%"     stopColor="#ef4444" stopOpacity={0.40} />
        </linearGradient>
      </defs>

      {/* Historical: green above zero, red below */}
      {histSegs.map((s, i) => (
        <path key={i} d={s.d} stroke={s.color} strokeWidth={2} fill="none"
          strokeLinejoin="round" strokeLinecap="round" />
      ))}

      {/* Projected: always blue dashed */}
      {projPts.length >= 2 && (
        <path d={pts2path(projPts)} stroke="#3b82f6" strokeWidth={2} fill="none"
          strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
      )}
    </g>
  );
}

const todayStr = new Date().toISOString().slice(0, 10);

interface Props {
  plans: SavingsPlan[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  startDate: Date;
  endDate: Date | null;
}

export function GrowthChart({ plans, deposits, withdrawals, startDate, endDate }: Props) {

  const data = useMemo(() =>
    calcChartSeries(plans, deposits, withdrawals, startDate, endDate ?? startOfDay(new Date())),
    [plans, deposits, withdrawals, startDate, endDate],
  );

  // Always include 0 in the domain so the gradient zero-stop aligns with the axis zero line
  const { yMin, yMax } = useMemo(() => {
    let mn = Infinity, mx = -Infinity;
    for (const p of data) {
      if (p.balance   !== undefined) { mn = Math.min(mn, p.balance);   mx = Math.max(mx, p.balance); }
      if (p.projected !== undefined) { mn = Math.min(mn, p.projected); mx = Math.max(mx, p.projected); }
    }
    if (!isFinite(mn)) { mn = 0; mx = 0; }
    return { yMin: Math.min(0, mn), yMax: Math.max(0, mx) };
  }, [data]);

  const hasData = data.length > 1;

  return (
    <div>
      {!hasData ? (
        <div className="h-45 flex items-center justify-center text-text-secondary text-sm">
          {t('range_no_data')}
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>

              {/* Gradient defs + colored lines via recharts v3 hooks — rendered before fills */}
              <ChartLines data={data} yMin={yMin} yMax={yMax} />

              {/* Fill areas only; line comes from ChartLines above */}
              <Area type="monotone" dataKey="balance"   stroke="none" fill="url(#hfill)"
                dot={false} connectNulls={false} isAnimationActive={false} baseValue={0} />
              <Area type="monotone" dataKey="projected" stroke="none" fill="url(#pfill)"
                dot={false} connectNulls={false} isAnimationActive={false} baseValue={0} />

              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }}
                tickFormatter={d => d.slice(0, 7)} interval="preserveStartEnd"
                axisLine={false} tickLine={false} />
              <YAxis domain={[yMin, yMax]} tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${Math.round(v as number)}`} width={45} />

              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
                itemStyle={{ color: '#f9fafb' }}
                formatter={(v, name) => [formatCurrency(v as number), name === 'balance' ? 'Balance' : 'Projected']}
              />

              <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
              <ReferenceLine x={todayStr} stroke="#6b7280" strokeDasharray="3 3" strokeWidth={1}
                label={{ value: 'Today', position: 'top', fill: '#6b7280', fontSize: 9 }} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-2 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-brand" />
              <span className="text-[10px] text-text-secondary">{t('chart_historical')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5" style={{ borderTop: '2px dashed #3b82f6' }} />
              <span className="text-[10px] text-text-secondary">{t('chart_projected')}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
