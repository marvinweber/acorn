export type Locale = 'de' | 'en';

const translations = {
  de: {
    // Nav
    overview: 'Übersicht',
    accounts: 'Konten',
    settings: 'Einstellungen',

    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    add: 'Hinzufügen',
    name: 'Name',
    note: 'Notiz',
    amount: 'Betrag',
    date: 'Datum',
    optional: 'optional',
    confirm_delete: 'Wirklich löschen?',
    no_data: 'Keine Daten',
    balance: 'Guthaben',
    total: 'Gesamt',

    // Accounts
    account: 'Konto',
    account_name: 'Kontoname',
    new_account: 'Neues Konto',
    edit_account: 'Konto bearbeiten',
    delete_account: 'Konto löschen',
    no_accounts: 'Noch keine Konten. Erstelle dein erstes Konto.',
    account_note: 'Notiz zum Konto',

    // Acorns
    acorn: 'Acorn',
    acorns: 'Acorns',
    new_acorn: 'Neues Acorn',
    edit_acorn: 'Acorn bearbeiten',
    delete_acorn: 'Acorn löschen',
    no_acorns: 'Noch keine Acorns in diesem Konto.',
    target_amount: 'Zielbetrag',
    target_date: 'Zieldatum',
    acorn_note: 'Notiz zum Acorn',
    progress: 'Fortschritt',

    // Savings Plans
    savings_plan: 'Sparplan',
    savings_plans: 'Sparpläne',
    new_savings_plan: 'Neuer Sparplan',
    edit_savings_plan: 'Sparplan bearbeiten',
    delete_savings_plan: 'Sparplan löschen',
    no_savings_plans: 'Keine Sparpläne.',
    rhythm: 'Rhythmus',
    start: 'Start',
    end: 'Ende',
    weekly: 'Wöchentlich',
    monthly: 'Monatlich',
    quarterly: 'Vierteljährlich',
    yearly: 'Jährlich',

    // Deposits & Withdrawals
    deposit: 'Einzahlung',
    deposits: 'Einzahlungen',
    withdrawal: 'Auszahlung',
    withdrawals: 'Auszahlungen',
    new_deposit: 'Neue Einzahlung',
    new_withdrawal: 'Neue Auszahlung',
    edit_deposit: 'Einzahlung bearbeiten',
    edit_withdrawal: 'Auszahlung bearbeiten',
    no_deposits: 'Keine Einzahlungen.',
    no_withdrawals: 'Keine Auszahlungen.',
    transactions: 'Transaktionen',
    no_transactions: 'Keine Transaktionen.',

    // Overview
    total_balance: 'Gesamtguthaben',
    all_accounts: 'Alle Konten',

    // Charts
    growth_chart: 'Wachstum',
    allocation_chart: 'Verteilung',
    unallocated: 'Nicht zugewiesen',

    // Settings
    language: 'Sprache',
    sync: 'Synchronisierung',
    sync_beta_label: 'Beta',
    sync_cors_note: 'WebDAV-Sync erfordert, dass dein Server CORS-Anfragen von dieser Seite erlaubt. Bei Nextcloud kannst du das in der ',
    sync_cors_note_link: 'config.php',
    sync_cors_note_suffix: ' konfigurieren (cors.allowed-domains). Andere Anbieter bieten ähnliche Einstellungen an.',
    webdav_url: 'WebDAV-URL',
    webdav_username: 'Benutzername',
    webdav_password: 'App-Token / Passwort',
    sync_now: 'Jetzt synchronisieren',
    sync_status: 'Sync-Status',
    last_sync: 'Letzter Sync',
    sync_enabled: 'Sync aktiviert',
    export_data: 'Daten exportieren',
    import_data: 'Daten importieren',
    import_warning: 'Achtung: Importieren überschreibt alle lokalen Daten.',
    import_export: 'Import / Export',
    syncing: 'Synchronisiere…',
    sync_success: 'Sync erfolgreich',
    sync_error: 'Sync fehlgeschlagen',
    never: 'Nie',
    german: 'Deutsch',
    english: 'Englisch',

    // Icon
    icon: 'Symbol',
    pick_icon: 'Symbol wählen',

    // Storage
    storage_title: 'Datenspeicher aktivieren',
    storage_body: 'Acorn benötigt die Erlaubnis, Daten dauerhaft in deinem Browser zu speichern. Ohne diese Erlaubnis können deine Daten beim Schließen des Browsers verloren gehen.',
    storage_grant: 'Speicher erlauben',
    storage_denied_title: 'Speicher nicht erlaubt',
    storage_denied_body: 'Dauerhafter Speicher wurde nicht automatisch gewährt. Installiere Acorn als App – das löst das Problem dauerhaft. Alternativ kannst du die Seite als Lesezeichen speichern und es erneut versuchen.',
    storage_install: 'App installieren',
    storage_retry: 'Erneut anfragen',
    storage_continue: 'Trotzdem fortfahren',
    storage_section: 'Speicher',
    storage_status_granted: 'Dauerhafter Speicher aktiv',
    storage_check: 'Berechtigung erneut anfragen',
    storage_warning_title: 'Kein dauerhafter Speicher',
    storage_warning_body: 'Deine Daten könnten beim Schließen des Browsers gelöscht werden. Installiere Acorn als App oder exportiere regelmäßig.',
    storage_unsupported_warning_body: 'Dein Browser unterstützt keine Speicherberechtigungen. Exportiere regelmäßig, um Datenverlust zu vermeiden.',
    storage_unsupported: 'Dein Browser unterstützt keine Speicherberechtigungen. Daten könnten unter Speicherdruck verloren gehen.',

    // History toggle
    show_history: 'Ältere anzeigen',
    hide_history: 'Ältere verbergen',
    older_items_hidden: 'Ältere Einträge ausgeblendet',

    // Range picker
    range_picker_title: 'Zeitraum',
    range_past: 'Vergangenheit',
    range_future: 'Prognose',
    range_custom: 'Benutzerdefiniert',
    range_from: 'Von',
    range_to_optional: 'Bis (optional)',
    range_to_placeholder: 'Heute (keine Prognose)',
    range_reset_to_presets: 'Voreinstellungen',
    range_no_data: 'Keine Daten in diesem Zeitraum',
    range_summary_all_history: 'Gesamter Verlauf',
    range_summary_today: 'Heute',
    chart_historical: 'Historisch',
    chart_projected: 'Prognose',

    // Onboarding
    show_onboarding: 'Einführung nochmals anzeigen',
    onboarding_skip: 'Überspringen',
    onboarding_next: 'Weiter',
    onboarding_done: 'Los geht\'s!',
    onboarding_1_title: 'Willkommen bei Acorn 🌰',
    onboarding_1_body: 'Acorn hilft dir, virtuell zu sparen – direkt in deinem Browser, ohne Konto und ohne Cloud-Zwang.',
    onboarding_why_title: 'Warum „Acorn"? 🌳',
    onboarding_why_body: 'Eine Eichel sieht unscheinbar aus – aber in ihr steckt schon alles. Genau so funktioniert Acorn: kleine, konsequente Entscheidungen, die ruhig und ohne Drama über Zeit wachsen. Kein Finanzprodukt, kein Lärm. Nur etwas Persönliches, das sich entfaltet.',
    onboarding_privacy_title: 'Deine Daten, dein Gerät 🔒',
    onboarding_privacy_body: 'Acorn speichert alles standardmäßig nur in deinem Browser – kein Server, keine Cloud, kein Konto erforderlich. Optional kannst du eine eigene WebDAV-Verbindung einrichten und Daten zwischen Geräten synchronisieren. Ohne Sync verlässt kein einziges Byte dein Gerät.',
    onboarding_backup_title: 'Mach regelmäßig Backups 💾',
    onboarding_backup_body: 'Da Acorn lokal im Browser speichert, können Daten beim Leeren des Browser-Speichers verloren gehen. Exportiere deine Daten regelmäßig über die Einstellungen – besonders wenn du keine Synchronisierung nutzt. Ein Export dauert nur Sekunden.',
    onboarding_2_title: 'Konten 🏦',
    onboarding_2_body: 'Ein Konto repräsentiert ein echtes Bankkonto. Du kannst mehrere Konten anlegen und jedem beliebig viele Eicheln zuweisen.',
    onboarding_3_title: 'Acorns 🌰',
    onboarding_3_body: 'Ein Acorn ist ein virtuelles Sparglas – z.B. für den Urlaub, ein neues Fahrrad oder einen Notfallfonds. Jedes Acorn gehört zu genau einem Konto.',
    onboarding_4_title: 'Sparpläne 📅',
    onboarding_4_body: 'Sparpläne buchen automatisch einen Betrag in dein Acorn – wöchentlich, monatlich, quartalsweise oder jährlich. Die Beträge werden deterministisch berechnet, keine Buchungen nötig.',
    onboarding_5_title: 'Ein- & Auszahlungen 💸',
    onboarding_5_body: 'Neben Sparplänen kannst du jederzeit manuelle Einzahlungen und Auszahlungen erfassen – z.B. wenn du Geld entnimmst oder einen Bonus einzahlst.',
    onboarding_6_title: 'Alles im Blick 📊',
    onboarding_6_body: 'Die Übersicht zeigt alle Konten und Acorns auf einen Blick. Tippe auf ein Acorn für Details, Wachstumsdiagramme und Prognosen.',
  },
  en: {
    overview: 'Overview',
    accounts: 'Accounts',
    settings: 'Settings',

    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    name: 'Name',
    note: 'Note',
    amount: 'Amount',
    date: 'Date',
    optional: 'optional',
    confirm_delete: 'Really delete?',
    no_data: 'No data',
    balance: 'Balance',
    total: 'Total',

    account: 'Account',
    account_name: 'Account name',
    new_account: 'New account',
    edit_account: 'Edit account',
    delete_account: 'Delete account',
    no_accounts: 'No accounts yet. Create your first account.',
    account_note: 'Account note',

    acorn: 'Acorn',
    acorns: 'Acorns',
    new_acorn: 'New acorn',
    edit_acorn: 'Edit acorn',
    delete_acorn: 'Delete acorn',
    no_acorns: 'No acorns in this account yet.',
    target_amount: 'Target amount',
    target_date: 'Target date',
    acorn_note: 'Acorn note',
    progress: 'Progress',

    savings_plan: 'Savings plan',
    savings_plans: 'Savings plans',
    new_savings_plan: 'New savings plan',
    edit_savings_plan: 'Edit savings plan',
    delete_savings_plan: 'Delete savings plan',
    no_savings_plans: 'No savings plans.',
    rhythm: 'Rhythm',
    start: 'Start',
    end: 'End',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',

    deposit: 'Deposit',
    deposits: 'Deposits',
    withdrawal: 'Withdrawal',
    withdrawals: 'Withdrawals',
    new_deposit: 'New deposit',
    new_withdrawal: 'New withdrawal',
    edit_deposit: 'Edit deposit',
    edit_withdrawal: 'Edit withdrawal',
    no_deposits: 'No deposits.',
    no_withdrawals: 'No withdrawals.',
    transactions: 'Transactions',
    no_transactions: 'No transactions.',

    total_balance: 'Total balance',
    all_accounts: 'All accounts',

    growth_chart: 'Growth',
    allocation_chart: 'Allocation',
    unallocated: 'Unallocated',

    language: 'Language',
    sync: 'Sync',
    sync_beta_label: 'Beta',
    sync_cors_note: 'WebDAV sync requires your server to allow CORS requests from this origin. For Nextcloud, add this origin to ',
    sync_cors_note_link: 'config.php',
    sync_cors_note_suffix: ' (cors.allowed-domains). Other providers offer similar settings.',
    webdav_url: 'WebDAV URL',
    webdav_username: 'Username',
    webdav_password: 'App token / password',
    sync_now: 'Sync now',
    sync_status: 'Sync status',
    last_sync: 'Last sync',
    sync_enabled: 'Sync enabled',
    export_data: 'Export data',
    import_data: 'Import data',
    import_warning: 'Warning: Importing will overwrite all local data.',
    import_export: 'Import / Export',
    syncing: 'Syncing…',
    sync_success: 'Sync successful',
    sync_error: 'Sync failed',
    never: 'Never',
    german: 'German',
    english: 'English',

    // Icon
    icon: 'Icon',
    pick_icon: 'Pick icon',

    // Storage
    storage_title: 'Enable persistent storage',
    storage_body: 'Acorn needs permission to store your data persistently in your browser. Without this permission, your data may be lost when you close the browser.',
    storage_grant: 'Allow storage',
    storage_denied_title: 'Storage not granted',
    storage_denied_body: 'Persistent storage was not granted automatically. Installing Acorn as an app fixes this permanently. Alternatively, bookmark the page and try again.',
    storage_install: 'Install app',
    storage_retry: 'Try again',
    storage_continue: 'Continue anyway',
    storage_section: 'Storage',
    storage_status_granted: 'Persistent storage active',
    storage_check: 'Request permission again',
    storage_warning_title: 'Storage not persistent',
    storage_warning_body: 'Your data may be cleared when the browser is closed. Install Acorn as an app or export regularly.',
    storage_unsupported_warning_body: 'Your browser does not support storage permissions. Export regularly to avoid data loss.',
    storage_unsupported: 'Your browser does not support storage permissions. Data may be lost under storage pressure.',

    // History toggle
    show_history: 'Show older',
    hide_history: 'Hide older',
    older_items_hidden: 'Older items hidden',

    // Range picker
    range_picker_title: 'View Range',
    range_past: 'Past',
    range_future: 'Projection',
    range_custom: 'Custom dates',
    range_from: 'From',
    range_to_optional: 'To (optional)',
    range_to_placeholder: 'Today (no projection)',
    range_reset_to_presets: 'Back to presets',
    range_no_data: 'No data in this range',
    range_summary_all_history: 'All history',
    range_summary_today: 'Today',
    chart_historical: 'Historical',
    chart_projected: 'Projected',

    // Onboarding
    show_onboarding: 'Show introduction again',
    onboarding_skip: 'Skip',
    onboarding_next: 'Next',
    onboarding_done: 'Get started!',
    onboarding_1_title: 'Welcome to Acorn 🌰',
    onboarding_1_body: 'Acorn helps you save virtually — right in your browser, no account needed, no cloud required.',
    onboarding_why_title: 'Why "Acorn"? 🌳',
    onboarding_why_body: 'An acorn looks unremarkable — but it already holds everything it needs. That\'s the idea behind Acorn: small, consistent decisions that grow quietly and steadily over time. No financial jargon, no noise. Just something personal, unfolding at its own pace.',
    onboarding_privacy_title: 'Your data, your device 🔒',
    onboarding_privacy_body: 'Acorn stores everything locally in your browser by default — no server, no cloud, no account required. Optionally, you can set up your own WebDAV connection to sync across devices. Without sync, not a single byte leaves your device.',
    onboarding_backup_title: 'Back up regularly 💾',
    onboarding_backup_body: 'Because Acorn stores data locally in your browser, it can be lost if browser storage is cleared. Export your data regularly from Settings — especially if you are not using sync. An export takes only a few seconds.',
    onboarding_2_title: 'Accounts 🏦',
    onboarding_2_body: 'An account represents a real bank account. You can create multiple accounts and assign any number of Acorns to each one.',
    onboarding_3_title: 'Acorns 🌰',
    onboarding_3_body: 'An Acorn is a virtual savings jar — for example for a vacation, a new bike, or an emergency fund. Each Acorn belongs to exactly one account.',
    onboarding_4_title: 'Savings Plans 📅',
    onboarding_4_body: 'Savings plans automatically credit an amount to your Acorn — weekly, monthly, quarterly, or yearly. Amounts are calculated deterministically, no manual bookings needed.',
    onboarding_5_title: 'Deposits & Withdrawals 💸',
    onboarding_5_body: 'Alongside savings plans, you can record manual deposits and withdrawals at any time — for example when you take money out or add a bonus.',
    onboarding_6_title: 'Everything at a glance 📊',
    onboarding_6_body: 'The overview shows all accounts and Acorns at a glance. Tap an Acorn for details, growth charts, and projections.',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

let currentLocale: Locale = (localStorage.getItem('locale') as Locale) || 'de';

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
}

export function t(key: TranslationKey): string {
  return (translations[currentLocale] as Record<string, string>)[key] ?? (translations.en as Record<string, string>)[key] ?? key;
}

export function formatCurrency(amount: number, locale?: Locale): string {
  const loc = locale || currentLocale;
  return new Intl.NumberFormat(loc === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string, locale?: Locale): string {
  const loc = locale || currentLocale;
  return new Intl.DateTimeFormat(loc === 'de' ? 'de-DE' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}
