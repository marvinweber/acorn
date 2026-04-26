import { Home, Landmark, Repeat, Settings } from 'lucide-react';
import { t } from '../i18n';

export type NavTab = 'overview' | 'accounts' | 'orders' | 'settings';

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

export function BottomNav({ active, onChange }: Props) {
  const items: { id: NavTab; icon: typeof Home; label: string }[] = [
    { id: 'overview', icon: Home, label: t('overview') },
    { id: 'accounts', icon: Landmark, label: t('accounts') },
    { id: 'orders', icon: Repeat, label: t('orders') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#374151] bg-surface-alt max-w-120 mx-auto">
      <div className="flex">
        {items.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors cursor-pointer ${
              active === id
                ? 'text-brand'
                : 'text-text-secondary active:text-text-primary'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
