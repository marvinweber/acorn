import { HardDrive } from 'lucide-react';
import { t } from '../i18n';

interface Props {
  status: 'checking' | 'denied' | 'unsupported';
  onRequest: () => void;
  onContinueAnyway: () => void;
}

export function StorageGate({ status, onRequest, onContinueAnyway }: Props) {
  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 max-w-120 mx-auto">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-surface-alt border border-[#374151] flex items-center justify-center">
          <HardDrive size={36} className="text-brand" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {status === 'denied' ? t('storage_denied_title') : t('storage_title')}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            {status === 'denied' ? t('storage_denied_body') : t('storage_body')}
          </p>
          {status === 'unsupported' && (
            <p className="text-xs text-warning mt-2">{t('storage_unsupported')}</p>
          )}
        </div>

        {status === 'denied' || status === 'unsupported' ? (
          <button
            onClick={onContinueAnyway}
            className="w-full py-3 rounded-xl bg-[#374151] text-text-primary font-medium cursor-pointer hover:bg-[#4b5563] transition-colors"
          >
            {t('storage_continue')}
          </button>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onRequest}
              className="w-full py-3 rounded-xl bg-brand text-white font-medium cursor-pointer hover:bg-brand-dark transition-colors"
            >
              {t('storage_grant')}
            </button>
            <button
              onClick={onContinueAnyway}
              className="w-full py-3 rounded-xl bg-transparent text-[#6b7280] text-sm cursor-pointer hover:text-text-secondary transition-colors"
            >
              {t('storage_continue')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
