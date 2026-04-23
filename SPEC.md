# 🌰 Acorn — Product Specification

## Overview

Acorn is a mobile-first, offline-first single-page application for managing virtual savings jars called **Acorns**. All calculations run locally in the browser. State is persisted in IndexedDB and optionally synchronized with Nextcloud via WebDAV.

The app is designed to be simple, deterministic, fully offline-capable, and visually polished.

It supports **internationalization (i18n)** from the beginning, starting with **German** (default) and **English**.

The UI is built with a clean, minimal Tailwind CSS design system and includes modern, lightweight data visualizations.

---

## Internationalization (i18n)

- Supported languages: German (default), English
- All UI strings are externalized
- Language switcher available in Settings
- Dates and numbers formatted per locale

---

## Data Model

```ts
type Rhythm = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

interface Account {
  id: string;
  name: string;
  note?: string;
  createdAt: string;
}

interface Acorn {
  id: string;
  name: string;
  accountId: string;   // each Acorn belongs to exactly one Account
  targetAmount?: number;
  targetDate?: string;
  note?: string;
  createdAt: string;
}

interface SavingsPlan {
  id: string;
  acornId: string;
  amount: number;
  rhythm: Rhythm;
  start: string;
  end?: string;
  note?: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  acornId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

interface Deposit {
  id: string;
  acornId: string;
  amount: number;
  date: string;
  note?: string;
  createdAt: string;
}

interface AppState {
  accounts: Account[];
  acorns: Acorn[];
  savingsPlans: SavingsPlan[];
  withdrawals: Withdrawal[];
  deposits: Deposit[];
  lastModified: string;
}
```

---

## Domain Model

### Accounts

- Represent real-world bank accounts or money locations
- An Account can have multiple Acorns assigned to it
- No direct balance tracking — balance is derived from assigned Acorns

### Acorns (Virtual Savings Jars)

- The core entity of the application
- Each Acorn belongs to exactly one Account
- Represents a goal-based savings container
- Can contain:
  - Savings Plans (recurring automatic contributions)
  - Deposits (manual inflows)
  - Withdrawals (manual outflows)
- Optional: target amount and target date for goal tracking

### Savings Plans

- Recurring contributions into an Acorn
- Defined by: amount, rhythm (weekly / monthly / quarterly / yearly), start date, optional end date
- Fully deterministic: no stored transactions, calculated on-the-fly from parameters

### Deposits

- Manual additions to an Acorn
- Represent external inflows (e.g., a bonus, gift)
- Always increase the Acorn balance

### Withdrawals

- Manual removals from an Acorn
- Always decrease the Acorn balance

---

## Calculations

### Acorn Balance

```
Balance =
  Σ(savings plan contributions up to today)
+ Σ(deposits up to today)
- Σ(withdrawals up to today)
```

Savings plan contributions are computed deterministically by counting how many recurrence dates fall between the plan start and the reference date.

### Account Balance

```
Account Balance = Σ(all Acorn balances for the account)
```

---

## Analytics & Visualizations

### Acorn Growth Chart

Located in the Acorn detail view.

- Shows balance development over time (historical) and future projection
- **Time range selectors**: 6M · 1Y · 5Y · All · Custom
  - Each range shows that period of history **and** the same period of future projection
  - Custom: user picks an arbitrary start and end date
- **Two-color rendering**:
  - **Green solid line**: historical balance up to today
  - **Blue dashed line**: future projection based on currently active savings plans
  - The two lines connect at today's data point
  - A vertical "Today" marker separates past from future
- Future projection only considers plans that have not yet ended; no new manual transactions are assumed

### Account Allocation Pie Chart

Located in the Account detail view.

- Shows how the account balance is distributed across its Acorns
- Each slice represents one Acorn's current balance
- Zero-balance Acorns are excluded from the chart

---

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | React + TypeScript                |
| Styling       | Tailwind CSS v4                   |
| Build         | Vite 5                            |
| State         | Zustand                           |
| Local Storage | IndexedDB (via `idb`)             |
| Date Handling | `date-fns`                        |
| Charts        | Recharts                          |
| Sync          | Native WebDAV (Fetch API)         |

---

## UI / UX

- Mobile-first, max content width ~480 px, centered on desktop
- Dark mode by default
- Tailwind-based design system with a green brand color

### Navigation

The app uses a **persistent bottom navigation** with three main sections:

#### 1. Overview

- Read-only summary of all Accounts and their Acorns
- Shows current balance per Acorn and total per Account
- Grand total balance across all Accounts
- **Clickable Acorn rows** navigate to the Acorn detail view inline within this tab

#### 2. Accounts

- Full CRUD for Accounts
- Account detail view:
  - List of assigned Acorns with balances
  - Allocation pie chart
  - Navigate into individual Acorn detail
- Acorn detail view:
  - Balance + goal progress bar
  - Growth chart with range selectors and future projection
  - CRUD for Savings Plans, Deposits, and Withdrawals

#### 3. Settings

- Language selector (German / English)
- Nextcloud WebDAV sync:
  - Server URL, username, app token / password
  - Enable / disable toggle
  - Manual "Sync now" button
  - Last sync timestamp
- Import / Export:
  - Export full state as a JSON file
  - Import state from a JSON file (overwrites local data)

### Interaction Patterns

- **Floating Action Button (FAB)**: multi-action FAB for creating context-appropriate entities (Account, Acorn, Savings Plan, Deposit, Withdrawal)
- **Bottom sheet modals** for all create / edit flows
- `cursor-pointer` on all interactive elements

---

## Persistence

### IndexedDB

- The full `AppState` is written to IndexedDB on every mutation
- Fully offline-first — the app works without any network

### WebDAV Sync

- Optional sync to a Nextcloud instance via WebDAV (PUT / GET on a single JSON file)
- **Last-write-wins** conflict resolution based on `lastModified` timestamp
- Sync is triggered manually from the Settings page

---

## Import / Export

- Export: serializes the full `AppState` to a JSON file download
- Import: reads a JSON file and overwrites local state (IndexedDB + Zustand store)
- No backend required

---

## Out of Scope (v1)

- Multi-user collaboration
- Push notifications / reminders
- Multiple currencies
- Categories / tagging
- Advanced budgeting (envelope system)
- Backend services
