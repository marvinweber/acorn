import { startOfDay, subWeeks, subMonths, subYears, addMonths, addYears, parseISO } from 'date-fns';
import { t, getLocale } from './i18n';

export type PastPreset   = '2W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'All';
export type FuturePreset = 'None' | '6M' | '1Y' | '3Y' | '5Y' | '10Y';

export type RangeState =
  | { mode: 'preset'; pastPreset: PastPreset; futurePreset: FuturePreset }
  | { mode: 'custom'; customStart: string; customEnd: string | null };

export const DEFAULT_RANGE: RangeState = { mode: 'preset', pastPreset: '1Y', futurePreset: '1Y' };

export function resolveRange(state: RangeState, earliestDate: Date | null): [Date, Date | null] {
  const today = startOfDay(new Date());

  if (state.mode === 'custom') {
    const start = state.customStart ? startOfDay(parseISO(state.customStart)) : subYears(today, 1);
    const end   = state.customEnd   ? startOfDay(parseISO(state.customEnd))   : null;
    return [start, end];
  }

  let start: Date = subYears(today, 1);
  switch (state.pastPreset) {
    case '2W':  start = subWeeks(today, 2); break;
    case '1M':  start = subMonths(today, 1); break;
    case '3M':  start = subMonths(today, 3); break;
    case '6M':  start = subMonths(today, 6); break;
    case '1Y':  start = subYears(today, 1); break;
    case '3Y':  start = subYears(today, 3); break;
    case '5Y':  start = subYears(today, 5); break;
    case 'All': start = earliestDate ? startOfDay(earliestDate) : subYears(today, 1); break;
  }

  let end: Date | null = addYears(today, 1);
  switch (state.futurePreset) {
    case 'None': end = null; break;
    case '6M':   end = addMonths(today, 6); break;
    case '1Y':   end = addYears(today, 1); break;
    case '3Y':   end = addYears(today, 3); break;
    case '5Y':   end = addYears(today, 5); break;
    case '10Y':  end = addYears(today, 10); break;
  }

  return [start, end];
}

export function formatRangeSummary(state: RangeState, earliestDate: Date | null): string {
  const locale = getLocale() === 'de' ? 'de-DE' : 'en-US';
  const fmt = (d: Date) => new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(d);
  const [start, end] = resolveRange(state, earliestDate);

  const startStr = state.mode === 'preset' && state.pastPreset === 'All'
    ? t('range_summary_all_history')
    : fmt(start);
  const endStr = end === null ? t('range_summary_today') : fmt(end);

  return `${startStr} – ${endStr}`;
}
