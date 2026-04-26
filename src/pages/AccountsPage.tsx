import { useState, useMemo } from 'react';
import { ChevronRight, Landmark, Pencil, Trash2, PieChart as PieIcon } from 'lucide-react';
import { useStore } from '../store';
import { calcAcornBalance } from '../calculations';
import { t, formatCurrency } from '../i18n';
import { BottomSheet } from '../components/BottomSheet';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmojiPickerField } from '../components/EmojiPicker';
import { FormInput, FormTextArea, FormSelect } from '../components/FormField';
import { AllocationChart } from '../components/AllocationChart';
import type { Account } from '../types';
import { AcornDetailPage } from './AcornDetailPage';

type View =
  | { type: 'list' }
  | { type: 'account'; accountId: string }
  | { type: 'acorn'; acornId: string; accountId: string };

export function AccountsPage() {
  const [view, setView] = useState<View>({ type: 'list' });

  if (view.type === 'acorn') {
    return (
      <AcornDetailPage
        acornId={view.acornId}
        onBack={() => setView({ type: 'account', accountId: view.accountId })}
      />
    );
  }

  if (view.type === 'account') {
    return (
      <AccountDetailView
        accountId={view.accountId}
        onBack={() => setView({ type: 'list' })}
        onSelectAcorn={acornId => setView({ type: 'acorn', acornId, accountId: view.accountId })}
      />
    );
  }

  return (
    <AccountListView onSelectAccount={id => setView({ type: 'account', accountId: id })} />
  );
}

// ─── Account List ────────────────────────────────────────────────────────────

function AccountListView({ onSelectAccount }: { onSelectAccount: (id: string) => void }) {
  const { accounts, acorns, savingsPlans, deposits, withdrawals, addAccount, updateAccount, deleteAccount } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Account | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const accountTotals = useMemo(() => {
    return Object.fromEntries(accounts.map(acc => {
      const total = acorns
        .filter(a => a.accountId === acc.id)
        .reduce((sum, acorn) => {
          return sum + calcAcornBalance(
            savingsPlans.filter(p => p.acornId === acorn.id),
            deposits.filter(d => d.acornId === acorn.id),
            withdrawals.filter(w => w.acornId === acorn.id),
          );
        }, 0);
      return [acc.id, total];
    }));
  }, [accounts, acorns, savingsPlans, deposits, withdrawals]);

  function openAdd() {
    setEditTarget(null); setName(''); setNote(''); setSheetOpen(true);
  }

  function openEdit(acc: Account) {
    setEditTarget(acc); setName(acc.name); setNote(acc.note ?? ''); setSheetOpen(true);
  }

  function handleSave() {
    if (!name.trim()) return;
    if (editTarget) updateAccount(editTarget.id, { name: name.trim(), note: note.trim() || undefined });
    else addAccount(name.trim(), note.trim() || undefined);
    setSheetOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{t('accounts')}</h3>
        <button onClick={openAdd} className="text-brand text-xs font-medium hover:opacity-80 cursor-pointer">
          + {t('new_account')}
        </button>
      </div>
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-text-secondary">
          <Landmark size={40} className="opacity-40" />
          <p className="text-sm">{t('no_accounts')}</p>
        </div>
      ) : (
        accounts.map(acc => (
          <div key={acc.id} className="bg-surface-alt rounded-xl border border-[#374151] overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#374151] transition-colors cursor-pointer"
              onClick={() => onSelectAccount(acc.id)}
            >
              <Landmark size={18} className="text-text-secondary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-sm truncate">{acc.name}</p>
                {acc.note && <p className="text-xs text-text-secondary truncate">{acc.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-brand">
                  {formatCurrency(accountTotals[acc.id] ?? 0)}
                </span>
                <ChevronRight size={16} className="text-[#6b7280]" />
              </div>
            </div>
            <div className="flex border-t border-[#374151]">
              <button
                onClick={() => openEdit(acc)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-[#374151] transition-colors cursor-pointer"
              >
                <Pencil size={13} /> {t('edit')}
              </button>
              <div className="w-px bg-[#374151]" />
              <button
                onClick={() => setDeleteTarget(acc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-danger hover:bg-[#374151] transition-colors cursor-pointer"
              >
                <Trash2 size={13} /> {t('delete')}
              </button>
            </div>
          </div>
        ))
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editTarget ? t('edit_account') : t('new_account')}>
        <div className="flex flex-col gap-4">
          <FormInput label={t('account_name')} value={name} onChange={setName} required />
          <FormTextArea label={`${t('note')} (${t('optional')})`} value={note} onChange={setNote} />
          <div className="flex gap-2 pt-2">
            <button onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#374151] text-text-secondary text-sm cursor-pointer">
              {t('cancel')}
            </button>
            <button onClick={handleSave} disabled={!name.trim()} className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-medium disabled:opacity-40 cursor-pointer">
              {t('save')}
            </button>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        message={t('confirm_delete')}
        onConfirm={() => { deleteAccount(deleteTarget!); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ─── Account Detail ───────────────────────────────────────────────────────────

export function AccountDetailView({
  accountId, onBack, onSelectAcorn,
}: {
  accountId: string;
  onBack: () => void;
  onSelectAcorn: (id: string) => void;
}) {
  const { accounts, acorns, savingsPlans, deposits, withdrawals, addAcorn, updateAcorn, deleteAcorn } = useStore();
  const account = accounts.find(a => a.id === accountId)!;
  const accountAcorns = acorns.filter(a => a.accountId === accountId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🌰');
  const [note, setNote] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [acornAccountId, setAcornAccountId] = useState(accountId);

  const acornBalances = useMemo(() =>
    Object.fromEntries(accountAcorns.map(acorn => [
      acorn.id,
      calcAcornBalance(
        savingsPlans.filter(p => p.acornId === acorn.id),
        deposits.filter(d => d.acornId === acorn.id),
        withdrawals.filter(w => w.acornId === acorn.id),
      ),
    ])),
    [accountAcorns, savingsPlans, deposits, withdrawals]
  );

  const total = Object.values(acornBalances).reduce((s, v) => s + v, 0);

  const pieData = useMemo(() =>
    accountAcorns.map(a => ({
      name: `${a.icon ?? '🌰'} ${a.name}`,
      value: Math.max(0, acornBalances[a.id] ?? 0),
    })),
    [accountAcorns, acornBalances]
  );

  function openAdd() {
    setEditId(null); setName(''); setIcon('🌰'); setNote(''); setTargetAmount(''); setTargetDate('');
    setAcornAccountId(accountId);
    setSheetOpen(true);
  }

  function openEdit(acorn: typeof acorns[0]) {
    setEditId(acorn.id); setName(acorn.name); setIcon(acorn.icon ?? '🌰'); setNote(acorn.note ?? '');
    setTargetAmount(acorn.targetAmount?.toString() ?? '');
    setTargetDate(acorn.targetDate ?? '');
    setAcornAccountId(acorn.accountId);
    setSheetOpen(true);
  }

  function handleSave() {
    if (!name.trim()) return;
    const data = {
      accountId: acornAccountId, name: name.trim(), icon, note: note.trim() || undefined,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      targetDate: targetDate || undefined,
    };
    if (editId) updateAcorn(editId, data);
    else addAcorn(data);
    setSheetOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      <button
        onClick={onBack}
        className="text-text-secondary text-sm hover:text-text-primary transition-colors self-start cursor-pointer"
      >
        ← {t('accounts')}
      </button>

      {/* Account summary */}
      <div className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <div className="flex items-center gap-2 mb-1">
          <Landmark size={16} className="text-text-secondary" />
          <span className="text-sm text-text-secondary">{t('account')}</span>
        </div>
        <p className="text-lg font-bold text-text-primary">{account?.name}</p>
        <p className="text-brand font-semibold mt-1">{formatCurrency(total)}</p>
        {account?.note && <p className="text-xs text-text-secondary mt-1">{account.note}</p>}
      </div>

      {/* Allocation pie chart */}
      {accountAcorns.length > 0 && (
        <div className="bg-surface-alt rounded-xl border border-[#374151] p-4">
          <div className="flex items-center gap-2 mb-2">
            <PieIcon size={14} className="text-text-secondary" />
            <h3 className="text-sm font-semibold text-text-primary">{t('allocation_chart')}</h3>
          </div>
          <AllocationChart data={pieData} emptyLabel={t('no_data')} />
        </div>
      )}

      {/* Acorns list */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{t('acorns')}</h3>
        <button onClick={openAdd} className="text-brand text-xs font-medium hover:opacity-80 cursor-pointer">
          + {t('new_acorn')}
        </button>
      </div>
      {accountAcorns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-text-secondary">
          <p className="text-sm">{t('no_acorns')}</p>
        </div>
      ) : (
        accountAcorns.map(acorn => (
          <div key={acorn.id} className="bg-surface-alt rounded-xl border border-[#374151] overflow-hidden">
            <div
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#374151] transition-colors cursor-pointer"
              onClick={() => onSelectAcorn(acorn.id)}
            >
              <span className="text-xl shrink-0">{acorn.icon ?? '🌰'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text-primary text-sm truncate">{acorn.name}</p>
                {acorn.note && <p className="text-xs text-text-secondary truncate">{acorn.note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-brand">
                  {formatCurrency(acornBalances[acorn.id] ?? 0)}
                </span>
                <ChevronRight size={16} className="text-[#6b7280]" />
              </div>
            </div>
            <div className="flex border-t border-[#374151]">
              <button
                onClick={() => openEdit(acorn)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-[#374151] transition-colors cursor-pointer"
              >
                <Pencil size={13} /> {t('edit')}
              </button>
              <div className="w-px bg-[#374151]" />
              <button
                onClick={() => setDeleteTarget(acorn.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-danger hover:bg-[#374151] transition-colors cursor-pointer"
              >
                <Trash2 size={13} /> {t('delete')}
              </button>
            </div>
          </div>
        ))
      )}

      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editId ? t('edit_acorn') : t('new_acorn')}>
        <div className="flex flex-col gap-4">
          <EmojiPickerField value={icon} onChange={setIcon} />
          <FormInput label={t('name')} value={name} onChange={setName} required />
          {accounts.length > 1 && (
            <FormSelect
              label={t('account')}
              value={acornAccountId}
              onChange={setAcornAccountId}
              options={accounts.map(a => ({ value: a.id, label: a.name }))}
            />
          )}
          <FormInput label={`${t('target_amount')} (${t('optional')})`} value={targetAmount} onChange={setTargetAmount} type="number" min="0" step="0.01" />
          <FormInput label={`${t('target_date')} (${t('optional')})`} value={targetDate} onChange={setTargetDate} type="date" />
          <FormInput label={`${t('note')} (${t('optional')})`} value={note} onChange={setNote} />
          <div className="flex gap-2 pt-2">
            <button onClick={() => setSheetOpen(false)} className="flex-1 py-2.5 rounded-lg bg-[#374151] text-text-secondary text-sm cursor-pointer">
              {t('cancel')}
            </button>
            <button onClick={handleSave} disabled={!name.trim()} className="flex-1 py-2.5 rounded-lg bg-brand text-white text-sm font-medium disabled:opacity-40 cursor-pointer">
              {t('save')}
            </button>
          </div>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={!!deleteTarget}
        message={t('confirm_delete')}
        onConfirm={() => { deleteAcorn(deleteTarget!); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
