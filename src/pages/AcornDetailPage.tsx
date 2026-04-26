import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { calcAcornBalance, convertToRhythm, getEarliestDate } from '../calculations';
import { t, formatCurrency, formatDate } from '../i18n';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FormInput, FormSelect } from '../components/FormField';
import { ProgressBar } from '../components/ProgressBar';
import { GrowthChart } from '../components/GrowthChart';
import { RangePicker } from '../components/RangePicker';
import { resolveRange, DEFAULT_RANGE } from '../ranges';
import type { RangeState } from '../ranges';
import type { Rhythm, SavingsPlan, Deposit, Withdrawal } from '../types';

const RHYTHM_OPTIONS = (): { value: Rhythm; label: string }[] => [
  { value: 'weekly', label: t('weekly') },
  { value: 'monthly', label: t('monthly') },
  { value: 'quarterly', label: t('quarterly') },
  { value: 'yearly', label: t('yearly') },
];

interface Props {
  acornId: string;
  onBack: () => void;
  backLabel?: string;
}

type Sheet =
  | null
  | { type: 'plan'; data?: SavingsPlan }
  | { type: 'deposit'; data?: Deposit }
  | { type: 'withdrawal'; data?: Withdrawal };

export function AcornDetailPage({ acornId, onBack, backLabel }: Props) {
  const {
    acorns, accounts, savingsPlans, deposits, withdrawals,
    addSavingsPlan, updateSavingsPlan, deleteSavingsPlan,
    addDeposit, updateDeposit, deleteDeposit,
    addWithdrawal, updateWithdrawal, deleteWithdrawal,
  } = useStore();

  const acorn = acorns.find(a => a.id === acornId)!;
  const account = accounts.find(a => a.id === acorn?.accountId);
  const plans = savingsPlans.filter(p => p.acornId === acornId);
  const deps = deposits.filter(d => d.acornId === acornId);
  const withs = withdrawals.filter(w => w.acornId === acornId);

  const balance = useMemo(() => calcAcornBalance(plans, deps, withs), [plans, deps, withs]);

  const [sheet, setSheet] = useState<Sheet>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [rangeState, setRangeState] = useState<RangeState>(DEFAULT_RANGE);

  const earliestDate = useMemo(() => getEarliestDate(plans, deps, withs), [plans, deps, withs]);
  const [chartStart, chartEnd] = useMemo(() => resolveRange(rangeState, earliestDate), [rangeState, earliestDate]);
  const chartStartStr = chartStart.toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);

  const pastPlanCount = plans.filter(p => p.end && p.end < today).length;
  const pastDepCount = deps.filter(d => d.date < chartStartStr).length;
  const pastWithCount = withs.filter(w => w.date < chartStartStr).length;
  const pastCount = pastPlanCount + pastDepCount + pastWithCount;

  const visiblePlans = showHistory ? plans : plans.filter(p => !p.end || p.end >= today);
  const visibleDeps = showHistory ? deps : deps.filter(d => d.date >= chartStartStr);
  const visibleWiths = showHistory ? withs : withs.filter(w => w.date >= chartStartStr);

  const combinedTxs = useMemo(() => [
    ...visibleDeps.map(d => ({ ...d, txType: 'deposit' as const })),
    ...visibleWiths.map(w => ({ ...w, txType: 'withdrawal' as const })),
  ].sort((a, b) => b.date.localeCompare(a.date)), [visibleDeps, visibleWiths]);

  // Plan form
  const [planAmount, setPlanAmount] = useState('');
  const [planRhythm, setPlanRhythm] = useState<Rhythm>('monthly');
  const [planPlanningRhythm, setPlanPlanningRhythm] = useState<Rhythm>('monthly');
  const [planStart, setPlanStart] = useState(new Date().toISOString().slice(0, 10));
  const [planEnd, setPlanEnd] = useState('');
  const [planNote, setPlanNote] = useState('');

  // Deposit / Withdrawal form
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNote, setTxNote] = useState('');

  function openPlanSheet(data?: SavingsPlan) {
    if (data) {
      const pr = data.planningRhythm ?? data.rhythm;
      setPlanAmount(convertToRhythm(data.amount, data.rhythm, pr).toString());
      setPlanRhythm(data.rhythm);
      setPlanPlanningRhythm(pr);
      setPlanStart(data.start);
      setPlanEnd(data.end ?? '');
      setPlanNote(data.note ?? '');
    } else {
      setPlanAmount(''); setPlanRhythm('monthly'); setPlanPlanningRhythm('monthly');
      setPlanStart(new Date().toISOString().slice(0, 10));
      setPlanEnd(''); setPlanNote('');
    }
    setSheet({ type: 'plan', data });
  }

  function openTxSheet(type: 'deposit' | 'withdrawal', data?: Deposit | Withdrawal) {
    if (data) {
      setTxAmount(data.amount.toString());
      setTxDate(data.date);
      setTxNote(data.note ?? '');
    } else {
      setTxAmount(''); setTxDate(new Date().toISOString().slice(0, 10)); setTxNote('');
    }
    setSheet({ type, data } as Exclude<Sheet, null | { type: 'plan' }>);
  }

  function savePlan() {
    if (!planAmount) return;
    const bookingAmount = convertToRhythm(parseFloat(planAmount), planPlanningRhythm, planRhythm);
    const data = {
      acornId, amount: bookingAmount, rhythm: planRhythm,
      start: planStart, end: planEnd || undefined, note: planNote || undefined,
      ...(planPlanningRhythm !== planRhythm ? { planningRhythm: planPlanningRhythm } : {}),
    };
    if (sheet?.type === 'plan' && sheet.data) updateSavingsPlan(sheet.data.id, data);
    else addSavingsPlan(data);
    setSheet(null);
  }

  function saveTx() {
    if (!txAmount) return;
    const data = { acornId, amount: parseFloat(txAmount), date: txDate, note: txNote || undefined };
    if (sheet?.type === 'deposit') {
      if (sheet.data) updateDeposit(sheet.data.id, data);
      else addDeposit(data);
    } else if (sheet?.type === 'withdrawal') {
      if (sheet.data) updateWithdrawal((sheet.data as Withdrawal).id, data);
      else addWithdrawal(data);
    }
    setSheet(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'plan') deleteSavingsPlan(deleteTarget.id);
    else if (deleteTarget.type === 'deposit') deleteDeposit(deleteTarget.id);
    else if (deleteTarget.type === 'withdrawal') deleteWithdrawal(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (!acorn) return null;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="text-text-secondary text-sm hover:text-text-primary transition-colors self-start cursor-pointer"
      >
        ← {backLabel ?? account?.name ?? t('accounts')}
      </button>

      {/* Header card */}
      <div className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{acorn.icon ?? '🌰'}</span>
          <p className="text-xs text-text-secondary">{acorn.name}</p>
        </div>
        <p className="text-2xl font-bold text-text-primary">{formatCurrency(balance)}</p>
        {acorn.targetAmount && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>{t('progress')}</span>
              <span>{formatCurrency(acorn.targetAmount)}</span>
            </div>
            <ProgressBar value={balance} max={acorn.targetAmount} />
          </div>
        )}
        {acorn.targetDate && (
          <p className="text-xs text-text-secondary mt-1">{t('target_date')}: {formatDate(acorn.targetDate)}</p>
        )}
        {acorn.note && <p className="text-xs text-text-secondary mt-1">{acorn.note}</p>}
      </div>

      {/* Growth chart */}
      <div className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <h3 className="text-sm font-semibold text-text-primary mb-3">{t('growth_chart')}</h3>
        <GrowthChart
          plans={plans} deposits={deps} withdrawals={withs}
          startDate={chartStart} endDate={chartEnd}
        />
      </div>

      {/* History toggle */}
      {pastCount > 0 && (
        <button
          onClick={() => setShowHistory(h => !h)}
          className="self-center text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer px-3 py-1 rounded-full bg-surface-alt border border-[#374151]"
        >
          {showHistory ? t('hide_history') : `${t('show_history')} (${pastCount})`}
        </button>
      )}

      {/* Savings Plans */}
      <Section title={t('savings_plans')} onAdd={() => openPlanSheet()}>
        {visiblePlans.length === 0
          ? <EmptyRow label={!showHistory && pastPlanCount > 0 ? t('older_items_hidden') : t('no_savings_plans')} />
          : visiblePlans.map(plan => (
            <Row
              key={plan.id}
              primary={(() => {
                if (!plan.planningRhythm || plan.planningRhythm === plan.rhythm) {
                  return `${formatCurrency(plan.amount)} · ${t(plan.rhythm)}`;
                }
                const planningAmt = convertToRhythm(plan.amount, plan.rhythm, plan.planningRhythm);
                return `${formatCurrency(planningAmt)} · ${t(plan.planningRhythm)} (${t('booked')} ${formatCurrency(plan.amount)} · ${t(plan.rhythm)})`;
              })()}
              secondary={`${t('start')}: ${formatDate(plan.start)}${plan.end ? ` · ${t('end')}: ${formatDate(plan.end)}` : ''}`}
              note={plan.note}
              onEdit={() => openPlanSheet(plan)}
              onDelete={() => setDeleteTarget({ type: 'plan', id: plan.id })}
            />
          ))
        }
      </Section>

      {/* Transactions */}
      <Section
        title={t('transactions')}
        actions={[
          { label: t('deposit'), onClick: () => openTxSheet('deposit') },
          { label: t('withdrawal'), onClick: () => openTxSheet('withdrawal') },
        ]}
      >
        {combinedTxs.length === 0
          ? <EmptyRow label={!showHistory && (pastDepCount + pastWithCount) > 0 ? t('older_items_hidden') : t('no_transactions')} />
          : combinedTxs.map(tx => (
            <Row
              key={tx.id}
              primary={formatCurrency(tx.amount)}
              secondary={formatDate(tx.date)}
              note={tx.note}
              positive={tx.txType === 'deposit'}
              negative={tx.txType === 'withdrawal'}
              onEdit={() => openTxSheet(tx.txType, tx)}
              onDelete={() => setDeleteTarget({ type: tx.txType, id: tx.id })}
            />
          ))
        }
      </Section>

      <RangePicker state={rangeState} onChange={setRangeState} earliestDate={earliestDate} />

      {/* Savings Plan Sheet */}
      <BottomSheet
        open={sheet?.type === 'plan'}
        onClose={() => setSheet(null)}
        title={sheet?.type === 'plan' && sheet.data ? t('edit_savings_plan') : t('new_savings_plan')}
      >
        <div className="flex flex-col gap-4">
          <FormInput label={t('amount')} value={planAmount} onChange={setPlanAmount} type="number" min="0.01" step="0.01" required />
          <FormSelect label={t('planning_rhythm')} value={planPlanningRhythm} onChange={v => setPlanPlanningRhythm(v as Rhythm)} options={RHYTHM_OPTIONS()} />
          <FormSelect label={t('rhythm')} value={planRhythm} onChange={v => { const r = v as Rhythm; if (planPlanningRhythm === planRhythm) setPlanPlanningRhythm(r); setPlanRhythm(r); }} options={RHYTHM_OPTIONS()} />
          <FormInput label={t('start')} value={planStart} onChange={setPlanStart} type="date" required />
          <FormInput label={`${t('end')} (${t('optional')})`} value={planEnd} onChange={setPlanEnd} type="date" />
          <FormInput label={`${t('note')} (${t('optional')})`} value={planNote} onChange={setPlanNote} />
          <SaveCancelButtons onSave={savePlan} onCancel={() => setSheet(null)} disabled={!planAmount} />
        </div>
      </BottomSheet>

      {/* Deposit / Withdrawal Sheet */}
      <BottomSheet
        open={sheet?.type === 'deposit' || sheet?.type === 'withdrawal'}
        onClose={() => setSheet(null)}
        title={
          sheet?.type === 'deposit'
            ? (sheet.data ? t('edit_deposit') : t('new_deposit'))
            : (sheet?.data ? t('edit_withdrawal') : t('new_withdrawal'))
        }
      >
        <div className="flex flex-col gap-4">
          <FormInput label={t('amount')} value={txAmount} onChange={setTxAmount} type="number" min="0.01" step="0.01" required />
          <FormInput label={t('date')} value={txDate} onChange={setTxDate} type="date" required />
          <FormInput label={`${t('note')} (${t('optional')})`} value={txNote} onChange={setTxNote} />
          <SaveCancelButtons onSave={saveTx} onCancel={() => setSheet(null)} disabled={!txAmount} />
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        message={t('confirm_delete')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function Section({ title, onAdd, actions, children }: {
  title: string;
  onAdd?: () => void;
  actions?: { label: string; onClick: () => void }[];
  children: React.ReactNode;
}) {
  const btns = actions ?? (onAdd ? [{ label: t('add'), onClick: onAdd }] : []);
  return (
    <div className="bg-surface-alt rounded-xl border border-[#374151] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#374151]">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <div className="flex gap-3">
          {btns.map((b, i) => (
            <button key={i} onClick={b.onClick} className="text-brand text-xs font-medium hover:opacity-80 cursor-pointer">
              + {b.label}
            </button>
          ))}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="px-4 py-3 text-xs text-text-secondary">{label}</p>;
}

function Row({
  primary, secondary, note, positive, negative, onEdit, onDelete
}: {
  primary: string; secondary?: string; note?: string;
  positive?: boolean; negative?: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2d3748] last:border-0">
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${positive ? 'text-[#4ade80]' : negative ? 'text-[#f87171]' : 'text-text-primary'}`}>
          {primary}
        </p>
        {secondary && <p className="text-xs text-text-secondary">{secondary}</p>}
        {note && <p className="text-xs text-[#6b7280] italic truncate">{note}</p>}
      </div>
      <div className="flex gap-3 ml-3">
        <button onClick={onEdit} className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} className="text-text-secondary hover:text-danger transition-colors cursor-pointer">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function SaveCancelButtons({ onSave, onCancel, disabled }: { onSave: () => void; onCancel: () => void; disabled?: boolean }) {
  return (
    <div className="flex gap-2 pt-2">
      <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg bg-[#374151] text-text-secondary text-sm cursor-pointer">
        {t('cancel')}
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-medium disabled:opacity-40 cursor-pointer"
      >
        {t('save')}
      </button>
    </div>
  );
}
