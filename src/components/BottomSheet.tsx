import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-120 mx-auto">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative bg-surface-alt rounded-t-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#374151]">
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-4 py-4 pb-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
