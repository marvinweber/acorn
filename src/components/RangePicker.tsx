import { useState } from 'react';
import { SlidersHorizontal, ChevronUp } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { FormInput } from './FormField';
import { t } from '../i18n';
import { resolveRange, formatRangeSummary } from '../ranges';
import type { RangeState, PastPreset, FuturePreset } from '../ranges';

const PAST_PRESETS: { id: PastPreset; label: string }[] = [
  { id: '2W',  label: '2W' },
  { id: '1M',  label: '1M' },
  { id: '3M',  label: '3M' },
  { id: '6M',  label: '6M' },
  { id: '1Y',  label: '1Y' },
  { id: '3Y',  label: '3Y' },
  { id: '5Y',  label: '5Y' },
  { id: 'All', label: '∞'  },
];

const FUTURE_PRESETS: { id: FuturePreset; label: string }[] = [
  { id: 'None', label: '—'   },
  { id: '6M',   label: '6M'  },
  { id: '1Y',   label: '1Y'  },
  { id: '3Y',   label: '3Y'  },
  { id: '5Y',   label: '5Y'  },
  { id: '10Y',  label: '10Y' },
];

interface Props {
  state: RangeState;
  onChange: (s: RangeState) => void;
  earliestDate: Date | null;
}

export function RangePicker({ state, onChange, earliestDate }: Props) {
  const [open, setOpen] = useState(false);
  const summary = formatRangeSummary(state, earliestDate);
  const isCustom = state.mode === 'custom';
  const [resolvedStart, resolvedEnd] = resolveRange(state, earliestDate);

  const customStartVal = isCustom ? state.customStart : '';
  const customEndVal   = isCustom ? (state.customEnd ?? '') : '';

  function setPastPreset(preset: PastPreset) {
    onChange({
      mode: 'preset',
      pastPreset: preset,
      futurePreset: state.mode === 'preset' ? state.futurePreset : '1Y',
    });
  }

  function setFuturePreset(preset: FuturePreset) {
    onChange({
      mode: 'preset',
      pastPreset: state.mode === 'preset' ? state.pastPreset : '1Y',
      futurePreset: preset,
    });
  }

  function handleCustomStart(v: string) {
    onChange({
      mode: 'custom',
      customStart: v,
      customEnd: isCustom ? state.customEnd : (resolvedEnd?.toISOString().slice(0, 10) ?? null),
    });
  }

  function handleCustomEnd(v: string) {
    onChange({
      mode: 'custom',
      customStart: isCustom ? state.customStart : resolvedStart.toISOString().slice(0, 10),
      customEnd: v || null,
    });
  }

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-30 max-w-120 mx-auto px-4 pb-3">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-surface-alt rounded-xl border-2 border-[#374151] shadow-lg hover:border-[#4b5563] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={14} className={isCustom ? 'text-brand' : 'text-text-secondary'} />
            <span className="text-sm text-text-primary">{summary}</span>
          </div>
          <ChevronUp size={14} className="text-text-secondary" />
        </button>
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={t('range_picker_title')}>
        <div className="flex flex-col gap-5">

          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
              {t('range_past')}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {PAST_PRESETS.map(p => (
                <Pill
                  key={p.id}
                  label={p.label}
                  active={state.mode === 'preset' && state.pastPreset === p.id}
                  color="green"
                  onClick={() => setPastPreset(p.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
              {t('range_future')}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {FUTURE_PRESETS.map(p => (
                <Pill
                  key={p.id}
                  label={p.label}
                  active={state.mode === 'preset' && state.futurePreset === p.id}
                  color="blue"
                  onClick={() => setFuturePreset(p.id)}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-[#374151]" />

          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
              {t('range_custom')}
            </p>
            <div className="flex flex-col gap-3">
              <FormInput
                label={t('range_from')}
                value={customStartVal}
                onChange={handleCustomStart}
                type="date"
              />
              <FormInput
                label={t('range_to_optional')}
                value={customEndVal}
                onChange={handleCustomEnd}
                type="date"
              />
              {isCustom && (
                <button
                  onClick={() => onChange({ mode: 'preset', pastPreset: '1Y', futurePreset: '1Y' })}
                  className="text-xs text-text-secondary hover:text-text-primary transition-colors underline self-start cursor-pointer"
                >
                  {t('range_reset_to_presets')}
                </button>
              )}
            </div>
          </div>

        </div>
      </BottomSheet>
    </>
  );
}

function Pill({ label, active, color, onClick }: {
  label: string; active: boolean; color: 'green' | 'blue'; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
        active
          ? color === 'green' ? 'bg-brand text-white' : 'bg-[#3b82f6] text-white'
          : 'bg-surface-raised text-text-secondary hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
}
