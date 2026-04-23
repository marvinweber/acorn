import { describe, it, expect } from 'vitest'
import { calcPlanContributions, calcAcornBalance, getEarliestDate } from './calculations'
import type { SavingsPlan, Deposit, Withdrawal } from './types'

const plan = (overrides: Partial<SavingsPlan> = {}): SavingsPlan => ({
  id: '1',
  acornId: 'a1',
  amount: 100,
  rhythm: 'monthly',
  start: '2024-01-01',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
})

const deposit = (amount: number, date: string): Deposit =>
  ({ id: 'd1', acornId: 'a1', amount, date, createdAt: date })

const withdrawal = (amount: number, date: string): Withdrawal =>
  ({ id: 'w1', acornId: 'a1', amount, date, createdAt: date })

describe('calcPlanContributions', () => {
  it('returns 0 before the plan starts', () => {
    expect(calcPlanContributions(plan({ start: '2024-06-01' }), new Date('2024-01-01'))).toBe(0)
  })

  it('counts monthly contributions correctly', () => {
    // Jan 1, Feb 1, Mar 1 — all <= Mar 31 → 3 contributions
    expect(calcPlanContributions(plan({ start: '2024-01-01' }), new Date('2024-03-31'))).toBe(300)
  })

  it('respects the plan end date', () => {
    // end=Feb 28: Jan 1 and Feb 1 both <= Feb 28, Mar 1 would exceed end → 2 contributions
    expect(
      calcPlanContributions(plan({ start: '2024-01-01', end: '2024-02-28' }), new Date('2024-12-31')),
    ).toBe(200)
  })
})

describe('calcAcornBalance', () => {
  it('returns 0 for empty inputs', () => {
    expect(calcAcornBalance([], [], [], new Date())).toBe(0)
  })

  it('sums plan contributions and deposits, subtracts withdrawals', () => {
    // 3 monthly × 100 = 300, +50 deposit, -80 withdrawal = 270
    expect(
      calcAcornBalance(
        [plan({ start: '2024-01-01' })],
        [deposit(50, '2024-02-15')],
        [withdrawal(80, '2024-03-01')],
        new Date('2024-03-31'),
      ),
    ).toBe(270)
  })

  it('ignores transactions beyond upTo date', () => {
    expect(calcAcornBalance([], [deposit(500, '2025-01-01')], [], new Date('2024-12-31'))).toBe(0)
  })
})

describe('getEarliestDate', () => {
  it('returns null for empty inputs', () => {
    expect(getEarliestDate([], [], [])).toBeNull()
  })

  it('returns the earliest date across plans and transactions', () => {
    const result = getEarliestDate(
      [plan({ start: '2024-03-01' })],
      [deposit(100, '2023-06-15')],
      [],
    )
    // Use local date components — parseISO returns local midnight, toISOString() is UTC
    const d = result!
    expect(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`).toBe('2023-06-15')
  })
})
