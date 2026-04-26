import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useStore } from '../store';
import { convertToRhythm, isActivePlan } from '../calculations';
import { t, formatCurrency } from '../i18n';
import type { Rhythm } from '../types';

const RHYTHMS: Rhythm[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

const PERIOD_LABEL: Record<Rhythm, () => string> = {
  weekly: () => t('per_week'),
  monthly: () => t('per_month'),
  quarterly: () => t('per_quarter'),
  yearly: () => t('per_year'),
};

function FrequencyBar({ rhythm, onChange }: { rhythm: Rhythm; onChange: (r: Rhythm) => void }) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 max-w-120 mx-auto px-4 pb-3">
      <div className="flex gap-2 bg-surface-alt rounded-xl border border-[#374151] shadow-lg p-2">
        {RHYTHMS.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors cursor-pointer ${
              r === rhythm
                ? 'bg-brand text-white'
                : 'bg-surface-raised text-text-secondary hover:text-text-primary'
            }`}
          >
            {t(r)}
          </button>
        ))}
      </div>
    </div>
  );
}

interface AcornRow {
  acorn: { id: string; icon?: string; name: string };
  total: number;
}

function AccountCard({
  name, acornRows, accountTotal, rhythm, isExpanded, onToggle,
}: {
  name: string;
  acornRows: AcornRow[];
  accountTotal: number;
  rhythm: Rhythm;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const hasPlans = acornRows.length > 0;

  return (
    <div className="bg-surface-alt rounded-xl border border-[#374151] overflow-hidden">
      <div
        className={`flex items-center justify-between px-4 py-3 ${hasPlans ? 'cursor-pointer hover:bg-surface-raised transition-colors' : ''}`}
        onClick={hasPlans ? onToggle : undefined}
      >
        <span className="font-medium text-text-primary">{name}</span>
        {hasPlans ? (
          <div className="flex items-center gap-2">
            <span className="text-brand font-semibold">
              {formatCurrency(accountTotal)}{' '}
              <span className="text-xs font-normal text-text-secondary">{PERIOD_LABEL[rhythm]()}</span>
            </span>
            {isExpanded
              ? <ChevronUp size={16} className="text-text-secondary" />
              : <ChevronDown size={16} className="text-text-secondary" />
            }
          </div>
        ) : (
          <span className="text-xs text-text-secondary italic">{t('no_savings_plans_for_account')}</span>
        )}
      </div>

      {hasPlans && isExpanded && (
        <div className="divide-y divide-[#374151] border-t border-[#374151]">
          {acornRows.map(({ acorn, total }) => (
            <div key={acorn.id} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-text-secondary">
                {acorn.icon ? `${acorn.icon} ` : ''}{acorn.name}
              </span>
              <span className="text-sm text-text-secondary">{formatCurrency(total)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoFooter() {
  return (
    <div className="flex gap-2.5 rounded-xl bg-surface-alt border border-[#374151] px-4 py-3 mt-1">
      <Info size={15} className="text-text-secondary shrink-0 mt-0.5" />
      <p className="text-xs text-text-secondary leading-relaxed">{t('standing_orders_info')}</p>
    </div>
  );
}

export function StandingOrdersPage() {
  const { accounts, acorns, savingsPlans } = useStore();
  const [rhythm, setRhythm] = useState<Rhythm>('monthly');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const today = new Date();

  function toggleExpand(accountId: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  }

  const accountData = accounts.map(account => {
    const accountAcorns = acorns.filter(a => a.accountId === account.id);
    const acornRows = accountAcorns
      .map(acorn => {
        const plans = savingsPlans.filter(p => p.acornId === acorn.id && isActivePlan(p, today));
        const total = plans.reduce((sum, p) => sum + convertToRhythm(p.amount, p.rhythm, rhythm), 0);
        return { acorn, total, hasPlans: plans.length > 0 };
      })
      .filter(row => row.hasPlans);
    const accountTotal = acornRows.reduce((sum, r) => sum + r.total, 0);
    return { account, acornRows, accountTotal };
  });

  return (
    <>
      <div className="flex flex-col gap-3 pb-20">
        <p className="text-sm text-text-secondary">{t('standing_orders_subtitle')}</p>

        {accountData.map(({ account, acornRows, accountTotal }) => (
          <AccountCard
            key={account.id}
            name={account.name}
            acornRows={acornRows}
            accountTotal={accountTotal}
            rhythm={rhythm}
            isExpanded={expanded.has(account.id)}
            onToggle={() => toggleExpand(account.id)}
          />
        ))}

        <InfoFooter />
      </div>

      <FrequencyBar rhythm={rhythm} onChange={setRhythm} />
    </>
  );
}
