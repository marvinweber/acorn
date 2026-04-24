import { startOfDay, subMonths, subYears, addMonths, addYears } from 'date-fns';

export type PastRange   = '1M' | '3M' | '6M' | '1Y' | '5Y';
export type FutureRange = '6M' | '1Y' | '3Y' | '5Y' | '10Y';

export function getPastStart(p: PastRange): Date {
  const t = startOfDay(new Date());
  switch (p) {
    case '1M': return subMonths(t, 1);
    case '3M': return subMonths(t, 3);
    case '6M': return subMonths(t, 6);
    case '1Y': return subYears(t, 1);
    case '5Y': return subYears(t, 5);
  }
}

export function getFutureEnd(f: FutureRange): Date {
  const t = startOfDay(new Date());
  switch (f) {
    case '6M':  return addMonths(t, 6);
    case '1Y': return addYears(t, 1);
    case '3Y':  return addYears(t, 3);
    case '5Y': return addYears(t, 5);
    case '10Y': return addYears(t, 10);
  }
}
