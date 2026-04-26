import { useMemo, useState } from 'react';
import { ChevronRight, TrendingUp, Landmark } from 'lucide-react';
import { useStore } from '../store';
import { calcAcornBalance } from '../calculations';
import { t, formatCurrency } from '../i18n';
import { AcornDetailPage } from './AcornDetailPage';
import { AccountDetailView } from './AccountsPage';

export function OverviewPage() {
  const [selectedAcornId, setSelectedAcornId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const { accounts, acorns, savingsPlans, deposits, withdrawals } = useStore();

  const accountSummaries = useMemo(() => {
    return accounts.map(account => {
      const accountAcorns = acorns.filter(a => a.accountId === account.id);
      const acornData = accountAcorns.map(acorn => {
        const plans = savingsPlans.filter(p => p.acornId === acorn.id);
        const deps = deposits.filter(d => d.acornId === acorn.id);
        const withs = withdrawals.filter(w => w.acornId === acorn.id);
        return { acorn, balance: calcAcornBalance(plans, deps, withs) };
      });
      return { account, acornData, total: acornData.reduce((s, d) => s + d.balance, 0) };
    });
  }, [accounts, acorns, savingsPlans, deposits, withdrawals]);

  const grandTotal = accountSummaries.reduce((s, a) => s + a.total, 0);

  if (selectedAcornId) {
    const acorn = acorns.find(a => a.id === selectedAcornId);
    const account = accounts.find(a => a.id === acorn?.accountId);
    return (
      <AcornDetailPage
        acornId={selectedAcornId}
        backLabel={account?.name ?? t('overview')}
        onBack={() => setSelectedAcornId(null)}
      />
    );
  }

  if (selectedAccountId) {
    return (
      <AccountDetailView
        accountId={selectedAccountId}
        onBack={() => setSelectedAccountId(null)}
        onSelectAcorn={acornId => setSelectedAcornId(acornId)}
      />
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-text-secondary">
        <Landmark size={40} className="opacity-40" />
        <p className="text-sm">{t('no_accounts')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Grand total */}
      <div className="bg-surface-alt rounded-xl p-4 border border-[#374151]">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-brand" />
          <span className="text-xs text-text-secondary uppercase tracking-wide">{t('total_balance')}</span>
        </div>
        <p className="text-2xl font-bold text-text-primary">{formatCurrency(grandTotal)}</p>
        <p className="text-xs text-text-secondary mt-1">{t('all_accounts')}: {accounts.length}</p>
      </div>

      {/* Per-account */}
      {accountSummaries.map(({ account, acornData, total }) => (
        <div key={account.id} className="bg-surface-alt rounded-xl border border-[#374151] overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-[#374151] hover:bg-surface-raised transition-colors cursor-pointer"
            onClick={() => setSelectedAccountId(account.id)}
          >
            <div className="flex items-center gap-2">
              <Landmark size={16} className="text-text-secondary" />
              <span className="font-medium text-text-primary text-sm">{account.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand font-semibold text-sm">{formatCurrency(total)}</span>
              <ChevronRight size={14} className="text-text-secondary" />
            </div>
          </div>
          {acornData.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-secondary">{t('no_acorns')}</div>
          ) : (
            <div className="divide-y divide-[#374151]">
              {acornData.map(({ acorn, balance }) => (
                <div
                  key={acorn.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-[#374151] transition-colors cursor-pointer"
                  onClick={() => setSelectedAcornId(acorn.id)}
                >
                  <span className="text-lg shrink-0">{acorn.icon ?? '🌰'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary">{acorn.name}</p>
                    {acorn.targetAmount && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        {t('target_amount')}: {formatCurrency(acorn.targetAmount)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#d1fae5]">{formatCurrency(balance)}</span>
                    <ChevronRight size={14} className="text-[#6b7280]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
