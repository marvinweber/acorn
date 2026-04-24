import { useRef, useState } from 'react';
import { Download, Upload, RefreshCw, CheckCircle, AlertCircle, BookOpen, Smartphone } from 'lucide-react';
import { useStore } from '../store';
import { syncWithWebDAV } from '../webdav';
import { t, formatDate, type Locale } from '../i18n';
import { FormInput, FormToggle } from '../components/FormField';
import type { StoragePersistenceStatus } from '../db';

interface Props {
  onShowOnboarding: () => void;
  storageStatus: StoragePersistenceStatus;
  onInstall?: () => void;
  onRetryStorage: () => Promise<void>;
}

export function SettingsPage({ onShowOnboarding, storageStatus, onInstall, onRetryStorage }: Props) {
  const {
    locale, setLocale,
    webdav, setWebDAV,
    syncStatus, setSyncStatus,
    exportState, importState,
    accounts, acorns, savingsPlans, deposits, withdrawals, lastModified,
    hydrate,
  } = useStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState('');

  async function handleSync() {
    if (!webdav.url || !webdav.username) return;
    setSyncStatus('syncing');
    try {
      const localState = { accounts, acorns, savingsPlans, deposits, withdrawals, lastModified };
      const result = await syncWithWebDAV(webdav, localState);
      setWebDAV({ lastSync: new Date().toISOString() });
      hydrate(result);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      setSyncStatus('error', (e as Error).message);
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  }

  function handleExport() {
    const json = exportState();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acorn-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError('');
    fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        importState(ev.target!.result as string);
      } catch {
        setImportError('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const syncIcon = syncStatus === 'syncing'
    ? <RefreshCw size={16} className="animate-spin" />
    : syncStatus === 'success'
    ? <CheckCircle size={16} className="text-brand" />
    : syncStatus === 'error'
    ? <AlertCircle size={16} className="text-danger" />
    : <RefreshCw size={16} />;

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Language */}
      <section className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <h3 className="text-xs text-text-secondary uppercase tracking-wide mb-3">{t('language')}</h3>
        <div className="flex gap-2">
          {(['de', 'en'] as Locale[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                locale === lang
                  ? 'bg-brand text-white'
                  : 'bg-[#374151] text-text-secondary active:bg-[#4b5563]'
              }`}
            >
              {lang === 'de' ? t('german') : t('english')}
            </button>
          ))}
        </div>
      </section>

      {/* WebDAV Sync */}
      <section className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xs text-text-secondary uppercase tracking-wide">{t('sync')}</h3>
          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#78350f] text-[#fcd34d]">{t('sync_beta_label')}</span>
        </div>
        <div className="flex flex-col gap-3">
          <FormToggle
            label={t('sync_enabled')}
            checked={webdav.enabled}
            onChange={v => setWebDAV({ enabled: v })}
          />
          <FormInput
            label={t('webdav_url')}
            value={webdav.url}
            onChange={v => setWebDAV({ url: v })}
            placeholder="https://cloud.example.com/remote.php/dav/files/user/"
          />
          <FormInput
            label={t('webdav_username')}
            value={webdav.username}
            onChange={v => setWebDAV({ username: v })}
          />
          <FormInput
            label={t('webdav_password')}
            value={webdav.password}
            onChange={v => setWebDAV({ password: v })}
            type="password"
          />

          <p className="text-xs text-text-secondary leading-relaxed">
            {t('sync_cors_note')}
            <a
              href="https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/config_sample_php_parameters.html#cors-allowed-domains"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-[#6b7280] hover:text-text-secondary"
            >{t('sync_cors_note_link')}</a>
            {t('sync_cors_note_suffix')}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-text-secondary">
              <span>{t('last_sync')}: </span>
              <span>{webdav.lastSync ? formatDate(webdav.lastSync) : t('never')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {syncStatus === 'error' && (
                <span className="text-xs text-danger">{t('sync_error')}</span>
              )}
              {syncStatus === 'success' && (
                <span className="text-xs text-brand">{t('sync_success')}</span>
              )}
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={!webdav.enabled || !webdav.url || syncStatus === 'syncing'}
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#374151] text-text-primary text-sm font-medium disabled:opacity-40 active:bg-[#4b5563] transition-colors"
          >
            {syncIcon}
            {syncStatus === 'syncing' ? t('syncing') : t('sync_now')}
          </button>
        </div>
      </section>

      {/* Import / Export */}
      <section className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <h3 className="text-xs text-text-secondary uppercase tracking-wide mb-3">{t('import_export')}</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-[#374151] text-text-primary text-sm font-medium active:bg-[#4b5563] transition-colors"
          >
            <Download size={16} />
            {t('export_data')}
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 py-2.5 px-4 rounded-lg bg-[#374151] text-text-primary text-sm font-medium active:bg-[#4b5563] transition-colors"
          >
            <Upload size={16} />
            {t('import_data')}
          </button>
          <p className="text-xs text-text-secondary">{t('import_warning')}</p>
          {importError && <p className="text-xs text-danger">{importError}</p>}
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </section>

      {/* Storage */}
      <section className={`bg-surface-alt rounded-xl border p-4 ${storageStatus !== 'granted' ? 'border-warning/40' : 'border-[#374151]'}`}>
        <h3 className="text-xs text-text-secondary uppercase tracking-wide mb-3">{t('storage_section')}</h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {storageStatus === 'granted'
              ? <CheckCircle size={16} className="text-brand shrink-0" />
              : <AlertCircle size={16} className="text-warning shrink-0" />}
            <span className={`text-sm font-medium ${storageStatus === 'granted' ? 'text-text-primary' : 'text-warning'}`}>
              {storageStatus === 'granted' ? t('storage_status_granted') : t('storage_warning_title')}
            </span>
          </div>
          {storageStatus !== 'granted' && (
            <p className="text-xs text-text-secondary leading-relaxed">
              {storageStatus === 'unsupported' ? t('storage_unsupported_warning_body') : t('storage_warning_body')}
            </p>
          )}
          {onInstall && storageStatus !== 'granted' && (
            <button
              onClick={onInstall}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-brand text-white text-sm font-medium cursor-pointer hover:bg-brand-dark transition-colors"
            >
              <Smartphone size={15} />
              {t('storage_install')}
            </button>
          )}
          {storageStatus !== 'unsupported' && (
            <button
              onClick={onRetryStorage}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-surface-raised text-text-primary text-sm font-medium cursor-pointer hover:bg-[#4b5563] transition-colors"
            >
              <RefreshCw size={15} />
              {t('storage_check')}
            </button>
          )}
        </div>
      </section>

      {/* About / Onboarding */}
      <section className="bg-surface-alt rounded-xl border border-[#374151] p-4">
        <button
          onClick={onShowOnboarding}
          className="flex items-center gap-2 py-2.5 px-4 w-full rounded-lg bg-[#374151] text-text-primary text-sm font-medium hover:bg-[#4b5563] transition-colors cursor-pointer"
        >
          <BookOpen size={16} />
          {t('show_onboarding')}
        </button>
      </section>

      <p className="text-center text-xs text-text-secondary py-2">Acorn {__APP_VERSION__}</p>
    </div>
  );
}
