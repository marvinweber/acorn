import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { calcAcornBalance } from '../calculations';
import { t, formatCurrency, formatDate } from '../i18n';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FAB } from '../components/FAB';
import { FormInput, FormSelect } from '../components/FormField';
import { ProgressBar } from '../components/ProgressBar';
import { GrowthChart } from '../components/GrowthChart';
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

  // Plan form
  const [planAmount, setPlanAmount] = useState('');
  const [planRhythm, setPlanRhythm] = useState<Rhythm>('monthly');
  const [planStart, setPlanStart] = useState(new Date().toISOString().slice(0, 10));
  const [planEnd, setPlanEnd] = useState('');
  const [planNote, setPlanNote] = useState('');

  // Deposit / Withdrawal form
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txNote, setTxNote] = useState('');

  function openPlanSheet(data?: SavingsPlan) {
    if (data) {
      setPlanAmount(data.amount.toString());
      setPlanRhythm(data.rhythm);
      setPlanStart(data.start);
      setPlanEnd(data.end ?? '');
      setPlanNote(data.note ?? '');
    } else {
      setPlanAmount(''); setPlanRhythm('monthly');
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
    const data = {
      acornId, amount: parseFloat(planAmount), rhythm: planRhythm,
      start: planStart, end: planEnd || undefined, note: planNote || undefined,
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
    <div className="flex flex-col gap-4 pb-4">
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
        <GrowthChart plans={plans} deposits={deps} withdrawals={withs} />
      </div>

      {/* Savings Plans */}
      <Section title={t('savings_plans')} onAdd={() => openPlanSheet()}>
        {plans.length === 0
          ? <EmptyRow label={t('no_savings_plans')} />
          : plans.map(plan => (
            <Row
              key={plan.id}
              primary={`${formatCurrency(plan.amount)} · ${t(plan.rhythm)}`}
              secondary={`${t('start')}: ${formatDate(plan.start)}${plan.end ? ` · ${t('end')}: ${formatDate(plan.end)}` : ''}`}
              note={plan.note}
              onEdit={() => openPlanSheet(plan)}
              onDelete={() => setDeleteTarget({ type: 'plan', id: plan.id })}
            />
          ))
        }
      </Section>

      {/* Deposits */}
      <Section title={t('deposits')} onAdd={() => openTxSheet('deposit')}>
        {deps.length === 0
          ? <EmptyRow label={t('no_deposits')} />
          : deps.slice().reverse().map(dep => (
            <Row
              key={dep.id}
              primary={formatCurrency(dep.amount)}
              secondary={formatDate(dep.date)}
              note={dep.note}
              positive
              onEdit={() => openTxSheet('deposit', dep)}
              onDelete={() => setDeleteTarget({ type: 'deposit', id: dep.id })}
            />
          ))
        }
      </Section>

      {/* Withdrawals */}
      <Section title={t('withdrawals')} onAdd={() => openTxSheet('withdrawal')}>
        {withs.length === 0
          ? <EmptyRow label={t('no_withdrawals')} />
          : withs.slice().reverse().map(w => (
            <Row
              key={w.id}
              primary={formatCurrency(w.amount)}
              secondary={formatDate(w.date)}
              note={w.note}
              negative
              onEdit={() => openTxSheet('withdrawal', w)}
              onDelete={() => setDeleteTarget({ type: 'withdrawal', id: w.id })}
            />
          ))
        }
      </Section>

      <FAB actions={[
        { label: t('new_savings_plan'), onClick: () => openPlanSheet() },
        { label: t('new_deposit'), onClick: () => openTxSheet('deposit') },
        { label: t('new_withdrawal'), onClick: () => openTxSheet('withdrawal') },
      ]} />

      {/* Savings Plan Sheet */}
      <BottomSheet
        open={sheet?.type === 'plan'}
        onClose={() => setSheet(null)}
        title={sheet?.type === 'plan' && sheet.data ? t('edit_savings_plan') : t('new_savings_plan')}
      >
        <div className="flex flex-col gap-4">
          <FormInput label={t('amount')} value={planAmount} onChange={setPlanAmount} type="number" min="0.01" step="0.01" required />
          <FormSelect label={t('rhythm')} value={planRhythm} onChange={v => setPlanRhythm(v as Rhythm)} options={RHYTHM_OPTIONS()} />
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

function Section({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-surface-alt rounded-xl border border-[#374151] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#374151]">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <button onClick={onAdd} className="text-brand text-xs font-medium hover:opacity-80 cursor-pointer">
          + {t('add')}
        </button>
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
