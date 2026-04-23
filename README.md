# 🌰 Acorn

> Small, consistent decisions — growing into something significant over time.

Acorn is a **mobile-first, offline-first** personal savings app that runs entirely in your browser. No backend, no account, no cloud dependency. You organise your money into virtual savings jars called *Acorns*, attach them to real bank accounts, set up recurring savings plans, and watch your balance grow — all calculated locally, all stored in IndexedDB.

The name is intentional: an acorn looks unremarkable, but it already holds everything it needs. That's the philosophy — small, quiet, deterministic. No financial jargon, no overengineering.

---

## Features

- **Virtual savings jars** — create as many Acorns as you like, each assigned to a real bank account, with an optional emoji icon, target amount, and target date
- **Savings plans** — define recurring contributions (weekly, monthly, quarterly, yearly); balances are calculated deterministically on-the-fly, no stored transactions
- **Manual deposits & withdrawals** — record one-off inflows and outflows at any time
- **Goal tracking** — progress bar toward a target amount; target date displayed for reference
- **Growth chart** — balance history + future projection in a single view, with 6M / 1Y / 5Y / All / Custom range selectors and a clear today-marker
- **Allocation pie chart** — per-account distribution across all Acorns at a glance
- **Offline-first** — all data lives in your browser's IndexedDB; the app works with no network at all
- **Storage persistence** — requests `navigator.storage.persist()` on first launch so Firefox and other browsers don't evict data under storage pressure
- **Nextcloud WebDAV sync** — optional sync to a Nextcloud instance; last-write-wins conflict resolution, triggered manually
- **Import / Export** — full JSON backup and restore, no server required
- **Internationalisation** — German (default) and English; switch any time in Settings
- **Onboarding** — guided first-run walkthrough; re-accessible from Settings

---

## Getting Started

**Prerequisites:** Node.js ≥ 20, [pnpm](https://pnpm.io)

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
pnpm build   # production build → dist/
```

The `dist/` folder is a self-contained static site — deploy to any web server or CDN.

---

## Quick Usage

1. **Create an Account** — FAB in the *Accounts* tab → give it a name (e.g. "Checking Account")
2. **Create an Acorn** — open the account → FAB → pick an icon, set a name and optional goal
3. **Add a Savings Plan** — inside the Acorn → FAB → *New savings plan*, set amount and rhythm
4. **Record transactions** — *New deposit* or *New withdrawal* for one-off changes
5. **Browse the Overview** — tap any Acorn row to drill into its detail and growth chart
6. **Set up sync** *(optional)* — Settings → WebDAV URL, credentials, enable toggle

---

## Tech Stack

| Layer       | Technology            |
|-------------|-----------------------|
| Framework   | React 18 + TypeScript |
| Styling     | Tailwind CSS v4       |
| Build       | Vite 5                |
| State       | Zustand               |
| Persistence | IndexedDB via `idb`   |
| Dates       | `date-fns`            |
| Charts      | Recharts              |
| Sync        | WebDAV via Fetch API  |

---

## Project Structure

```
src/
├── components/
│   ├── AllocationChart.tsx     # Pie chart — account balance distribution
│   ├── BottomNav.tsx
│   ├── BottomSheet.tsx
│   ├── ConfirmDialog.tsx
│   ├── EmojiPicker.tsx         # Acorn icon picker
│   ├── FAB.tsx
│   ├── FormField.tsx
│   ├── GrowthChart.tsx         # Time-ranged chart with future projection
│   ├── Onboarding.tsx          # First-run walkthrough
│   ├── ProgressBar.tsx
│   └── StorageGate.tsx         # Storage-persistence permission screen
├── pages/
│   ├── AccountsPage.tsx        # Account CRUD + Acorn CRUD + allocation chart
│   ├── AcornDetailPage.tsx     # Balance, growth chart, plans / deposits / withdrawals
│   ├── OverviewPage.tsx        # Read-only summary; tap Acorns to drill in
│   └── SettingsPage.tsx        # Language, WebDAV sync, import / export, onboarding
├── calculations.ts             # Pure balance & chart-series calculations
├── db.ts                       # IndexedDB read / write + storage-persistence check
├── i18n.ts                     # Translations (de / en) + locale helpers
├── store.ts                    # Zustand store — all mutations
├── types.ts                    # TypeScript data model
└── webdav.ts                   # WebDAV sync (GET / PUT, last-write-wins)
```

---

## Further Documentation

- **Product spec:** [SPEC.md](./SPEC.md)
