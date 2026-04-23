import { t } from '../i18n';

interface Props {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, onConfirm, onCancel }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 max-w-120 mx-auto">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} />
      <div className="relative bg-surface-alt border border-[#374151] rounded-xl p-5 w-full max-w-xs shadow-xl">
        <p className="text-text-primary text-sm mb-4">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm bg-danger text-white font-medium hover:bg-red-700 transition-colors cursor-pointer"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
