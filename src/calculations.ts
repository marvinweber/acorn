import {
  addWeeks, addMonths, addQuarters, addYears,
  subMonths, subYears,
  isBefore, isAfter, parseISO, startOfDay
} from 'date-fns';
import type { SavingsPlan, Deposit, Withdrawal, Rhythm } from './types';

function advanceByRhythm(date: Date, rhythm: Rhythm): Date {
  switch (rhythm) {
    case 'weekly': return addWeeks(date, 1);
    case 'monthly': return addMonths(date, 1);
    case 'quarterly': return addQuarters(date, 1);
    case 'yearly': return addYears(date, 1);
  }
}

export function calcPlanContributions(plan: SavingsPlan, upTo: Date = new Date()): number {
  let count = 0;
  let cursor = startOfDay(parseISO(plan.start));
  const end = plan.end ? startOfDay(parseISO(plan.end)) : null;
  const limit = startOfDay(upTo);

  while (!isAfter(cursor, limit)) {
    if (end && isAfter(cursor, end)) break;
    count++;
    cursor = advanceByRhythm(cursor, plan.rhythm);
  }
  return count * plan.amount;
}

export function calcAcornBalance(
  plans: SavingsPlan[],
  deposits: Deposit[],
  withdrawals: Withdrawal[],
  upTo: Date = new Date()
): number {
  const upToDay = startOfDay(upTo);
  const planTotal = plans.reduce((sum, p) => sum + calcPlanContributions(p, upToDay), 0);
  const depositTotal = deposits
    .filter(d => !isAfter(startOfDay(parseISO(d.date)), upToDay))
    .reduce((sum, d) => sum + d.amount, 0);
  const withdrawalTotal = withdrawals
    .filter(w => !isAfter(startOfDay(parseISO(w.date)), upToDay))
    .reduce((sum, w) => sum + w.amount, 0);
  return planTotal + depositTotal - withdrawalTotal;
}

export type TimeRange = '6M' | '1Y' | '5Y' | 'all' | 'custom';

export interface ChartDataPoint {
  date: string;
  balance?: number;
  projected?: number;
}

export function getRangeBounds(
  range: TimeRange,
  customStart?: string,
  customEnd?: string,
  earliestDate?: Date
): { start: Date; end: Date } {
  const today = startOfDay(new Date());
  switch (range) {
    case '6M':
      return { start: subMonths(today, 6), end: addMonths(today, 6) };
    case '1Y':
      return { start: subYears(today, 1), end: addYears(today, 1) };
    case '5Y':
      return { start: subYears(today, 5), end: addYears(today, 5) };
    case 'all':
      return {
        start: earliestDate ? startOfDay(earliestDate) : subYears(today, 1),
        end: addYears(today, 1),
      };
    case 'custom':
      return {
        start: customStart ? startOfDay(parseISO(customStart)) : subYears(today, 1),
        end: customEnd ? startOfDay(parseISO(customEnd)) : addYears(today, 1),
      };
  }
}

export function calcChartSeries(
  plans: SavingsPlan[],
  deposits: Deposit[],
  withdrawals: Withdrawal[],
  rangeStart: Date,
  rangeEnd: Date
): ChartDataPoint[] {
  const today = startOfDay(new Date());
  const points: ChartDataPoint[] = [];

  // Only plans that are still active as of today contribute to projection
  const activePlans = plans.filter(p => !p.end || !isBefore(startOfDay(parseISO(p.end)), today));
  const balanceToday = calcAcornBalance(plans, deposits, withdrawals, today);

  let cursor = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);

  while (!isAfter(cursor, end)) {
    if (!isAfter(cursor, today)) {
      const bal = calcAcornBalance(plans, deposits, withdrawals, cursor);
      const point: ChartDataPoint = { date: cursor.toISOString().slice(0, 10), balance: bal };
      // Bridge point: today also gets projected value so the two lines connect
      if (cursor.getTime() === today.getTime()) {
        point.projected = bal;
      }
      points.push(point);
    } else {
      // Future projection: today's balance + future plan contributions + future manual transactions
      const futureContribs = activePlans.reduce((sum, plan) => {
        return sum + calcPlanContributions(plan, cursor) - calcPlanContributions(plan, today);
      }, 0);
      const futureDeposits = deposits
        .filter(d => { const day = startOfDay(parseISO(d.date)); return isAfter(day, today) && !isAfter(day, cursor); })
        .reduce((sum, d) => sum + d.amount, 0);
      const futureWithdrawals = withdrawals
        .filter(w => { const day = startOfDay(parseISO(w.date)); return isAfter(day, today) && !isAfter(day, cursor); })
        .reduce((sum, w) => sum + w.amount, 0);
      points.push({
        date: cursor.toISOString().slice(0, 10),
        projected: balanceToday + futureContribs + futureDeposits - futureWithdrawals,
      });
    }
    cursor = addMonths(cursor, 1);
  }

  return points;
}

const YEARLY_FACTORS: Record<Rhythm, number> = {
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};

export function convertToRhythm(amount: number, from: Rhythm, to: Rhythm): number {
  if (from === to) return amount;
  const yearly = amount * YEARLY_FACTORS[from];
  return yearly / YEARLY_FACTORS[to];
}

export function isActivePlan(plan: SavingsPlan, asOf: Date): boolean {
  const start = startOfDay(parseISO(plan.start));
  const today = startOfDay(asOf);
  if (isAfter(start, today)) return false;
  if (plan.end) {
    const end = startOfDay(parseISO(plan.end));
    if (!isAfter(end, today)) return false;
  }
  return true;
}

export function getEarliestDate(
  plans: SavingsPlan[],
  deposits: Deposit[],
  withdrawals: Withdrawal[]
): Date | null {
  const dates: Date[] = [
    ...plans.map(p => parseISO(p.start)),
    ...deposits.map(d => parseISO(d.date)),
    ...withdrawals.map(w => parseISO(w.date)),
  ];
  if (dates.length === 0) return null;
  return dates.reduce((min, d) => isBefore(d, min) ? d : min);
}
