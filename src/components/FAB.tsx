import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface FABAction {
  label: string;
  onClick: () => void;
}

interface Props {
  actions: FABAction[];
}

export function FAB({ actions }: Props) {
  const [open, setOpen] = useState(false);

  if (actions.length === 1) {
    return (
      <button
        onClick={actions[0].onClick}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center hover:bg-brand-dark transition-colors cursor-pointer"
        aria-label={actions[0].label}
      >
        <Plus size={24} />
      </button>
    );
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
        {open && actions.map((action, i) => (
          <button
            key={i}
            onClick={() => { action.onClick(); setOpen(false); }}
            className="flex items-center gap-2 bg-surface-alt border border-[#374151] text-text-primary px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-[#374151] transition-colors cursor-pointer"
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-14 h-14 rounded-full bg-brand text-white shadow-lg flex items-center justify-center active:bg-brand-dark transition-colors"
        >
          {open ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </>
  );
}
